import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";

describe("Stripe KPIs Utilities", () => {
  describe("formatCurrency", () => {
    it("should format EUR currency correctly", () => {
      const result = formatCurrency(12450, "eur");
      expect(result).toContain("12");
      expect(result).toContain("450");
      // French locale uses € symbol
      expect(result).toMatch(/€|EUR/);
    });

    it("should format zero correctly", () => {
      const result = formatCurrency(0, "eur");
      expect(result).toContain("0");
    });

    it("should handle large amounts", () => {
      const result = formatCurrency(1000000, "eur");
      expect(result).toContain("1");
      expect(result).toContain("000");
    });

    it("should default to EUR currency", () => {
      const result = formatCurrency(100);
      expect(result).toMatch(/€|EUR/);
    });
  });

  describe("formatPercentage", () => {
    it("should format positive percentages with + sign", () => {
      expect(formatPercentage(8.2)).toBe("+8.2%");
      expect(formatPercentage(100)).toBe("+100.0%");
    });

    it("should format negative percentages without + sign", () => {
      expect(formatPercentage(-5.5)).toBe("-5.5%");
      expect(formatPercentage(-0.3)).toBe("-0.3%");
    });

    it("should format zero without sign", () => {
      expect(formatPercentage(0)).toBe("0.0%");
    });

    it("should respect showSign parameter", () => {
      expect(formatPercentage(8.2, false)).toBe("8.2%");
      expect(formatPercentage(-5.5, false)).toBe("-5.5%");
    });
  });
});
