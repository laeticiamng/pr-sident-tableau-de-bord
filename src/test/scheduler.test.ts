import { describe, it, expect } from "vitest";
import { formatCronExpression } from "@/hooks/useScheduler";

describe("Scheduler Utilities", () => {
  describe("formatCronExpression", () => {
    it("should format weekday expressions correctly", () => {
      expect(formatCronExpression("0 7 * * 1-5")).toBe("Lun-Ven à 7h");
      expect(formatCronExpression("30 8 * * 1-5")).toBe("Lun-Ven à 8h30");
    });

    it("should format single day expressions", () => {
      expect(formatCronExpression("0 8 * * 1")).toBe("Lundi à 8h");
      expect(formatCronExpression("0 10 * * 3")).toBe("Mercredi à 10h");
      expect(formatCronExpression("0 9 * * 5")).toBe("Vendredi à 9h");
    });

    it("should format daily expressions", () => {
      expect(formatCronExpression("0 18 * * *")).toBe("Tous les jours à 18h");
    });

    it("should handle minutes in the expression", () => {
      expect(formatCronExpression("30 9 * * 1")).toBe("Lundi à 9h30");
      expect(formatCronExpression("15 14 * * *")).toBe("Tous les jours à 14h15");
    });
  });
});
