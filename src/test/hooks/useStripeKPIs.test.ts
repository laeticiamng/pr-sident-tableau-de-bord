import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock Supabase functions
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: {
          success: true,
          mock: false,
          kpis: {
            mrr: 12450,
            mrrChange: 8.2,
            activeSubscriptions: 247,
            activeSubscriptionsChange: 12,
            churnRate: 2.1,
            churnRateChange: -0.3,
            totalCustomers: 1247,
            newCustomersThisMonth: 45,
            revenueThisMonth: 15400,
            revenueLastMonth: 14200,
            currency: "eur",
            lastUpdated: "2026-02-03T12:00:00.000Z",
          },
        },
        error: null,
      }),
    },
  },
}));

// Create wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

describe("useStripeKPIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export useStripeKPIs function", async () => {
    const { useStripeKPIs } = await import("@/hooks/useStripeKPIs");
    expect(typeof useStripeKPIs).toBe("function");
  });

  it("should return query result structure", async () => {
    const { useStripeKPIs } = await import("@/hooks/useStripeKPIs");
    
    const { result } = renderHook(() => useStripeKPIs(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("isError");
  });
});

describe("formatCurrency", () => {
  it("should format EUR currency correctly", async () => {
    const { formatCurrency } = await import("@/hooks/useStripeKPIs");
    const result = formatCurrency(12450, "eur");
    
    expect(result).toContain("12");
    expect(result).toContain("450");
    expect(result.includes("€") || result.includes("EUR")).toBe(true);
  });

  it("should format USD currency correctly", async () => {
    const { formatCurrency } = await import("@/hooks/useStripeKPIs");
    const result = formatCurrency(1000, "usd");
    
    expect(result).toContain("1");
    expect(result).toContain("000");
    expect(result.includes("$") || result.includes("USD")).toBe(true);
  });

  it("should default to EUR", async () => {
    const { formatCurrency } = await import("@/hooks/useStripeKPIs");
    const result = formatCurrency(5000);
    
    expect(result.includes("€") || result.includes("EUR")).toBe(true);
  });

  it("should handle zero", async () => {
    const { formatCurrency } = await import("@/hooks/useStripeKPIs");
    const result = formatCurrency(0, "eur");
    
    expect(result).toContain("0");
  });

  it("should handle large numbers", async () => {
    const { formatCurrency } = await import("@/hooks/useStripeKPIs");
    const result = formatCurrency(1000000, "eur");
    
    expect(result).toContain("1");
    expect(result).toContain("000");
  });
});

describe("formatPercentage", () => {
  it("should format positive percentage with sign", async () => {
    const { formatPercentage } = await import("@/hooks/useStripeKPIs");
    const result = formatPercentage(8.2);
    
    expect(result).toBe("+8.2%");
  });

  it("should format negative percentage", async () => {
    const { formatPercentage } = await import("@/hooks/useStripeKPIs");
    const result = formatPercentage(-3.5);
    
    expect(result).toBe("-3.5%");
  });

  it("should format zero percentage", async () => {
    const { formatPercentage } = await import("@/hooks/useStripeKPIs");
    const result = formatPercentage(0);
    
    expect(result).toBe("0.0%");
  });

  it("should hide sign when showSign is false", async () => {
    const { formatPercentage } = await import("@/hooks/useStripeKPIs");
    const result = formatPercentage(8.2, false);
    
    expect(result).toBe("8.2%");
  });

  it("should round to one decimal place", async () => {
    const { formatPercentage } = await import("@/hooks/useStripeKPIs");
    const result = formatPercentage(8.256);
    
    expect(result).toBe("+8.3%");
  });

  it("should handle very small percentages", async () => {
    const { formatPercentage } = await import("@/hooks/useStripeKPIs");
    const result = formatPercentage(0.05);
    
    expect(result).toBe("+0.1%");
  });

  it("should handle large percentages", async () => {
    const { formatPercentage } = await import("@/hooks/useStripeKPIs");
    const result = formatPercentage(150.5);
    
    expect(result).toBe("+150.5%");
  });
});
