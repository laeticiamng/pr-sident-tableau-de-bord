import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  type AbonnementStripe,
  type StripeKPIs,
  type TransactionSolde,
  assemblerKpis,
  bornesDePeriode,
  devisesObservees,
  listerStripe,
  reponseKpisDisponibles,
  reponseKpisIndisponibles,
  reponseSansCleStripe,
} from "./calculs.ts";
import {
  type ClientStripe,
  type PaiementStripe,
  type RepartitionClients,
  classerClients,
  lireIdentifiantsInternes,
  repartirClients,
} from "./clients.ts";

/**
 * Stripe KPIs - Récupération des métriques financières réelles
 * Calcule MRR, revenus et autres KPIs depuis Stripe (churn et variation nette : indisponibles, voir calculs.ts).
 * Contrat : voir ReponseKpisStripe (calculs.ts). Sans clé Stripe ou en cas d'erreur Stripe,
 * la réponse est HTTP 200 { success:false, available:false, reason, kpis:null } : jamais de
 * données factices ni de zéros présentés comme des mesures.
 * Les calculs sont dans calculs.ts (fonctions pures testées par Vitest).
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.error("[Stripe KPIs] Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Stripe KPIs] Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("[Stripe KPIs] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    // userId authenticated

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError || !hasOwnerRole) {
      console.error(`[Stripe KPIs] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // owner role verified
    // ============================================
    // END AUTHENTICATION CHECK
    // ============================================

    // Sans clé Stripe : réponse « indisponible » explicite. Aucune donnée factice, jamais.
    const sansCle = reponseSansCleStripe(STRIPE_SECRET_KEY);
    if (sansCle) {
      console.log("[Stripe KPIs] No Stripe key - returning unavailable");
      return new Response(JSON.stringify(sansCle), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[Stripe KPIs] Fetching real Stripe data...");

    // Helper pour les appels Stripe
    const stripeRequest = async (endpoint: string, params?: Record<string, string>) => {
      const url = new URL(`https://api.stripe.com/v1/${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.status}`);
      }
      
      return response.json();
    };

    // Dates de calcul (UTC)
    const maintenant = new Date();
    const { debutMois, debutMoisPrecedent } = bornesDePeriode(maintenant);

    // 0. Mode réel vérifié (revue du 18.10.2026) : une clé du mode test renvoyait 0 client et 0 € présentés comme
    // des mesures. Le solde porte `livemode` même quand le compte n'a aucun objet ; sans `true` explicite → indisponible.
    const solde = (await stripeRequest("balance")) as { livemode?: boolean };
    if (solde.livemode !== true) {
      console.log("[Stripe KPIs] Clé du mode test : indisponible");
      return new Response(JSON.stringify(reponseKpisIndisponibles("stripe_test_mode")), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compte réellement lu (identifiant public, e-mail du titulaire pour reconnaître ses propres comptes de test).
    // Facultatif : une clé restreinte peut ne pas y avoir accès ; rien n'est alors inventé (null).
    let compte: { id?: string; email?: string | null; default_currency?: string } = {};
    try {
      compte = (await stripeRequest("account")) as typeof compte;
    } catch (_e) {
      console.log("[Stripe KPIs] Compte Stripe non lisible avec cette clé (facultatif)");
    }

    // 1. Abonnements actifs (toutes pages) : MRR et nombre d'abonnements
    const abonnementsActifs = await listerStripe<AbonnementStripe>(stripeRequest, "subscriptions", {
      status: "active",
    });

    // 2. Clients (toutes pages), lus une seule fois. Pas de try/catch (revue Codex) : un échec remonte au
    // gestionnaire global (« indisponible ») plutôt que d'afficher 0 comme une mesure.
    const clients = await listerStripe<ClientStripe>(stripeRequest, "customers");
    const totalCustomers = clients.length;
    const newCustomersThisMonth = clients.filter((c) => typeof c.created === "number" && c.created >= debutMois).length;

    // 3. Paiements (toutes pages) : seule preuve d'un client réel, avec l'abonnement actif. Revue Codex : l'historique
    // complet peut dépasser la limite de pagination sur un gros compte ; cet échec ne rend indisponible QUE la
    // répartition (null, affichée « indisponible »), jamais les autres KPIs, et ne produit aucun chiffre de repli.
    let repartitionClients: RepartitionClients | null = null;
    try {
      const paiements = await listerStripe<PaiementStripe>(stripeRequest, "charges");
      const classement = classerClients(clients, paiements, abonnementsActifs as unknown as { customer?: string; status?: string }[], {
        emailCompteStripe: compte.email ?? null,
        identifiantsInternes: lireIdentifiantsInternes(Deno.env.get("STRIPE_IDENTIFIANTS_INTERNES")),
      });
      repartitionClients = repartirClients(clients, classement, debutMois);
    } catch (_e) {
      console.log("[Stripe KPIs] Répartition des clients indisponible (historique des paiements illisible)");
    }

    // 4. Churn et variation nette : non calculés (pas d'historique des statuts Stripe, voir calculs.ts).

    // 5. Encaissements : transactions de solde depuis le 1er du mois précédent (toutes pages). Revue Codex :
    // chaque paiement et chaque remboursement compte dans le mois de sa propre date. Pas de try/catch : un
    // échec remonte au gestionnaire global (« indisponible ») plutôt que d'afficher 0 comme une mesure.
    const transactions = await listerStripe<TransactionSolde>(stripeRequest, "balance_transactions", {
      "created[gte]": debutMoisPrecedent.toString(),
    });

    // 6. Devise : lue dans les prix et les transactions ; la devise du compte n'est utilisée que si aucun
    // objet n'en porte. Plusieurs devises → erreur → « indisponible » (jamais de total mélangé).
    const deviseCompte = devisesObservees(abonnementsActifs, transactions).size === 0 ? (compte.default_currency ?? null) : null;

    // MRR, chiffre encaissé net et croissance sur périodes équivalentes. mrrChange reste
    // null : Stripe ne fournit pas le MRR passé, et la variation des encaissements (qui
    // incluent paiements ponctuels et annuels) n'est pas une variation de MRR.
    const kpis: StripeKPIs = assemblerKpis({
      abonnementsActifs,
      totalCustomers,
      newCustomersThisMonth,
      transactions,
      maintenant,
      deviseCompte,
      clients: repartitionClients,
      idCompteStripe: compte.id ?? null,
    });

    console.log("[Stripe KPIs] KPIs calculés");

    return new Response(
      JSON.stringify(reponseKpisDisponibles(kpis)),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Stripe KPIs] Unexpected error:", error);
    // Erreur inattendue (Stripe injoignable, etc.) : « indisponible », sans zéros ni mock.
    return new Response(
      JSON.stringify(reponseKpisIndisponibles("stripe_error")),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
