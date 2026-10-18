import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { formatCurrency } from "@/hooks/useStripeKPIs";

/**
 * Revue Codex (#17) : les montants Stripe s'affichent dans la devise renvoyée par Stripe,
 * jamais avec un « € » supposé ni avec la devise par défaut de formatCurrency.
 */
const lire = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("affichage des montants Stripe dans leur devise", () => {
  it("formatCurrency suit la devise transmise", () => {
    expect(formatCurrency(100, "usd")).toMatch(/\$|US/);
    expect(formatCurrency(100, "chf")).toMatch(/CHF/);
  });

  it("aucun affichage compact du MRR ne retombe sur l'euro par défaut", () => {
    for (const f of ["src/components/hq/MobileBriefing.tsx", "src/pages/hq/JournalPage.tsx", "src/pages/hq/BriefingRoom.tsx"]) {
      const s = lire(f);
      expect(s, f).not.toMatch(/formatCurrency\(mrr\)/);
      expect(s, f).toMatch(/formatCurrency\(mrr, devise\)/);
    }
  });

  it("les widgets de croissance n'écrivent plus de « € » devant le MRR ou l'ARPU", () => {
    const resume = lire("src/components/hq/growth/GrowthSummaryWidget.tsx");
    expect(resume).not.toMatch(/`€\$\{metrics\.(mrr|arpu)/);
    expect(resume).toMatch(/formatCurrency\(metrics\.mrr\.value, metrics\.currency\)/);
    expect(lire("src/components/hq/growth/GrowthMetricsGrid.tsx")).toMatch(/formatCurrency\(metric\.value, metrics\.currency\)/);
  });
});
