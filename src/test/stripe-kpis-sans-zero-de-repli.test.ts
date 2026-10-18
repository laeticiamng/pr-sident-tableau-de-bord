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
    expect(source).toMatch(/const totalCustomers = \(await listerStripe\(stripeRequest, "customers"\)\)\.length;/);
  });

  it("seul le churn tolère un échec de lecture, et il devient null (pas 0)", () => {
    const catches = source.match(/}\s*catch\s*\(/g) ?? [];
    // un catch pour les annulés (churn → null) + le gestionnaire global
    expect(catches.length).toBe(2);
    expect(source).toMatch(/let abonnementsAnnules: AbonnementStripe\[\] \| null = null;/);
    expect(source).toMatch(/reponseKpisIndisponibles\("stripe_error"\)/);
  });
});
