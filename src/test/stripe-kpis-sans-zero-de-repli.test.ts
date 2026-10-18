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
    expect(catches.length).toBe(2);
    expect(source).toMatch(/try \{\s*compte = \(await stripeRequest\("account"\)\)/);
    // revue Codex : plus de lecture des abonnements annulés, le churn n'est pas estimé
    expect(source).not.toMatch(/status: "canceled"/);
    expect(source).toMatch(/reponseKpisIndisponibles\("stripe_error"\)/);
  });
});
