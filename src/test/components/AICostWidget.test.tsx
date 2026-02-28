import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

import { AICostWidget } from "@/components/hq/AICostWidget";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("AICostWidget", () => {
  it("renders without crashing", () => {
    renderWithProviders(<AICostWidget />);
    expect(screen.getByText("Consommation IA")).toBeInTheDocument();
  });

  it("renders compact mode", () => {
    renderWithProviders(<AICostWidget compact />);
    expect(screen.getByText("Crédits IA :")).toBeInTheDocument();
    expect(screen.queryByText("Consommation IA")).not.toBeInTheDocument();
  });

  it("displays budget sections", () => {
    renderWithProviders(<AICostWidget />);
    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText("Ce mois")).toBeInTheDocument();
  });

  it("shows 0.00€ when no runs (no NaN)", () => {
    renderWithProviders(<AICostWidget />);
    // Should display monetary values without NaN
    const allText = document.body.textContent || "";
    expect(allText).not.toContain("NaN");
    expect(allText).toContain("0.00€");
  });

  it("shows projection section", () => {
    renderWithProviders(<AICostWidget />);
    expect(screen.getByText(/Projection fin de mois/)).toBeInTheDocument();
  });
});
