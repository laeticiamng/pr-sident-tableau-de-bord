import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  type AbonnementStripe,
  type ChargeStripe,
  type StripeKPIs,
  assemblerKpis,
  bornesDePeriode,
  listerStripe,
  reponseKpisDisponibles,
  reponseKpisIndisponibles,
  reponseSansCleStripe,
} from "./calculs.ts";

/**
 * Stripe KPIs - Récupération des métriques financières réelles
 * Calcule MRR, churn, revenus et autres KPIs depuis Stripe.
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

    // 1. Abonnements actifs (toutes pages) : MRR et nombre d'abonnements
    const abonnementsActifs = await listerStripe<AbonnementStripe>(stripeRequest, "subscriptions", {
      status: "active",
    });

    // 2. Clients totaux (toutes pages)
    let totalCustomers = 0;
    try {
      totalCustomers = (await listerStripe(stripeRequest, "customers")).length;
    } catch (e) {
      console.log("[Stripe KPIs] Could not fetch customers");
    }

    // 3. Nouveaux clients ce mois
    let newCustomersThisMonth = 0;
    try {
      newCustomersThisMonth = (await listerStripe(stripeRequest, "customers", {
        "created[gte]": debutMois.toString(),
      })).length;
    } catch (e) {
      console.log("[Stripe KPIs] Could not fetch new customers");
    }

    // 4. Churn : abonnements annulés (toutes pages). Si la lecture échoue, le churn reste
    // indisponible (null) : on ne le remplace jamais par une valeur par défaut.
    let abonnementsAnnules: AbonnementStripe[] | null = null;
    try {
      abonnementsAnnules = await listerStripe<AbonnementStripe>(stripeRequest, "subscriptions", {
        status: "canceled",
      });
    } catch (e) {
      console.log("[Stripe KPIs] Could not fetch canceled subscriptions - churn unavailable");
    }

    // 5. Revenus (charges, toutes pages)
    // Pas de try/catch ici : un échec Stripe (même sur une page intermédiaire) doit remonter
    // au gestionnaire global plutôt que d'afficher 0 € comme s'il s'agissait d'une mesure.
    const chargesMoisCourant = await listerStripe<ChargeStripe>(stripeRequest, "charges", {
      "created[gte]": debutMois.toString(),
    });
    const chargesMoisPrecedent = await listerStripe<ChargeStripe>(stripeRequest, "charges", {
      "created[gte]": debutMoisPrecedent.toString(),
      "created[lt]": debutMois.toString(),
    });

    // MRR, chiffre encaissé net et croissance sur périodes équivalentes. mrrChange reste
    // null : Stripe ne fournit pas le MRR passé, et la variation des encaissements (qui
    // incluent paiements ponctuels et annuels) n'est pas une variation de MRR.
    const kpis: StripeKPIs = assemblerKpis({
      abonnementsActifs,
      totalCustomers,
      newCustomersThisMonth,
      chargesMoisCourant,
      chargesMoisPrecedent,
      maintenant,
      abonnementsAnnules,
    });

    console.log(`[Stripe KPIs] KPIs calculés (churn ${kpis.churnRate === null ? "indisponible" : "mesuré"})`);

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
