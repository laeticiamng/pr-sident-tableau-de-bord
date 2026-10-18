import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Revue Codex (PR #17, P1) : la fonction Edge ne doit jamais publier un compteur à 0 de repli avec
 * `available: true`. Les lectures Stripe des clients ne sont plus entourées d'un try/catch qui laissait 0 :
 * leur échec remonte au gestionnaire global, qui répond « indisponible ». (La fonction Deno n'est pas
 * exécutable sous Vitest : ce test garde la structure du code.)
 */
const source = readFileSync(join(process.cwd(), "supabase/functions/stripe-kpis/index.ts"), "utf8");

describe("stripe-kpis : aucun zéro de repli présenté comme une mesure", () => {
  it("les compteurs de clients ne sont pas initialisés à 0 avant une lecture protégée", () => {
    expect(source).not.toMatch(/let\s+totalCustomers\s*=\s*0/);
    expect(source).not.toMatch(/let\s+newCustomersThisMonth\s*=\s*0/);
    // 18.10.2026 : la liste des clients est lue une fois (classification réels / tests) ; son échec remonte toujours.
    expect(source).toMatch(/const clients = await listerStripe<ClientStripe>\(stripeRequest, "customers"\);/);
    expect(source).toMatch(/const totalCustomers = clients\.length;/);
  });

  it("aucun échec de lecture n'est toléré localement : tout remonte au gestionnaire global (indisponible)", () => {
    const catches = source.match(/}\s*catch\s*\(/g) ?? [];
    // Deux catch seulement : le gestionnaire global, et la lecture facultative du compte (identifiant public,
    // e-mail du titulaire) dont l'échec ne produit aucun chiffre — `compte` reste vide, rien n'est inventé.
    // Troisième catch (revue Codex, 18.10.2026) : la lecture de l'historique des paiements pour la répartition des
    // clients ; son échec laisse `repartitionClients` à null (« indisponible »), sans chiffre de repli.
    expect(catches.length).toBe(3);
    expect(source).toMatch(/let repartitionClients: RepartitionClients \| null = null;/);
    expect(source).not.toMatch(/repartitionClients = \{/);
    expect(source).toMatch(/try \{\s*compte = \(await stripeRequest\("account"\)\)/);
    // revue Codex : plus de lecture des abonnements annulés, le churn n'est pas estimé
    expect(source).not.toMatch(/status: "canceled"/);
    expect(source).toMatch(/reponseKpisIndisponibles\("stripe_error"\)/);
  });
});

describe("stripe-kpis : clé restreinte en lecture seule du mode réel", () => {
  it("le secret dédié STRIPE_KPIS_READ_KEY est prioritaire ; l'ancien secret n'est qu'un repli, jamais journalisé", () => {
    expect(source).toMatch(/Deno\.env\.get\("STRIPE_KPIS_READ_KEY"\)\?\.trim\(\) \|\| Deno\.env\.get\("STRIPE_SECRET_KEY"\)/);
    // la valeur de la clé n'apparaît dans aucun journal
    expect(source).not.toMatch(/console\.(log|error|warn)\([^)]*STRIPE_SECRET_KEY/);
    const status = readFileSync(join(process.cwd(), "supabase/functions/check-api-status/index.ts"), "utf8");
    // revue Codex : seule la clé dédiée compte comme connexion Stripe (le repli Lovable est du mode test)
    expect(status).toMatch(/stripe: !!Deno\.env\.get\("STRIPE_KPIS_READ_KEY"\)\?\.trim\(\),/);
    expect(status).not.toMatch(/stripe:[^\n]*STRIPE_SECRET_KEY/);
  });
});
