import { describe, it, expect } from "vitest";
import {
  listerStripe,
  type RequeteStripe,
} from "../../supabase/functions/stripe-kpis/calculs.ts";

/** Faux client Stripe paginé : `total` objets servis par pages de `limit` (max 100). */
function fausseApiPaginee(total: number) {
  const objets = Array.from({ length: total }, (_, i) => ({ id: `ch_${i}` }));
  const appels: Array<Record<string, string> | undefined> = [];
  const requete: RequeteStripe = async (_endpoint, params) => {
    appels.push(params);
    const limite = Math.min(Number(params?.limit ?? 10), 100);
    const debut = params?.starting_after
      ? objets.findIndex((o) => o.id === params.starting_after) + 1
      : 0;
    const data = objets.slice(debut, debut + limite);
    return { data, has_more: debut + limite < objets.length };
  };
  return { requete, appels };
}

describe("stripe-kpis — pagination des listes Stripe", () => {
  it("consomme toutes les pages (has_more / starting_after), pas seulement les 100 premiers éléments", async () => {
    const { requete, appels } = fausseApiPaginee(250);

    const charges = await listerStripe<{ id: string }>(requete, "charges", {
      "created[gte]": "1756684800",
      "created[lt]": "1759276800",
    });

    expect(charges).toHaveLength(250);
    expect(new Set(charges.map((c) => c.id)).size).toBe(250);
    expect(appels).toHaveLength(3);
    // Les filtres de période sont conservés sur chaque page.
    for (const params of appels) {
      expect(params?.["created[gte]"]).toBe("1756684800");
      expect(params?.["created[lt]"]).toBe("1759276800");
    }
    expect(appels[1]?.starting_after).toBe("ch_99");
    expect(appels[2]?.starting_after).toBe("ch_199");
  });

  it("s'arrête après une seule requête quand has_more est faux", async () => {
    const { requete, appels } = fausseApiPaginee(42);
    const charges = await listerStripe(requete, "charges");
    expect(charges).toHaveLength(42);
    expect(appels).toHaveLength(1);
  });

  it("échoue explicitement plutôt que de renvoyer une liste tronquée si la pagination ne progresse pas", async () => {
    const requete: RequeteStripe = async () => ({ data: [], has_more: true });
    await expect(listerStripe(requete, "charges")).rejects.toThrow(/pagination/i);
  });
});
