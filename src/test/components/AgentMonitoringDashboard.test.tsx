import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => {
  const channelMock = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  };
  return {
    supabase: {
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
      channel: vi.fn(() => channelMock),
      removeChannel: vi.fn(),
    },
  };
});

import { AgentMonitoringDashboard } from "@/components/hq/AgentMonitoringDashboard";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("AgentMonitoringDashboard", () => {
  it("renders without crashing", () => {
    renderWithProviders(<AgentMonitoringDashboard />);
    expect(screen.getByText("Monitoring Agents IA")).toBeInTheDocument();
  });

  it("renders KPI cards", () => {
    renderWithProviders(<AgentMonitoringDashboard />);
    expect(screen.getByText("Runs totaux")).toBeInTheDocument();
    expect(screen.getByText("Taux succès")).toBeInTheDocument();
    expect(screen.getByText("Agents actifs 24h")).toBeInTheDocument();
    expect(screen.getByText("Coût IA estimé")).toBeInTheDocument();
  });

  it("renders in compact mode without run launcher", () => {
    renderWithProviders(<AgentMonitoringDashboard compact />);
    expect(screen.getByText("Monitoring Agents IA")).toBeInTheDocument();
    expect(screen.queryByText("Lancer un Agent IA")).not.toBeInTheDocument();
  });

  it("renders history section", () => {
    renderWithProviders(<AgentMonitoringDashboard />);
    expect(screen.getByText("Historique des Runs")).toBeInTheDocument();
  });

  it("renders actualiser button", () => {
    renderWithProviders(<AgentMonitoringDashboard />);
    expect(screen.getByText("Actualiser")).toBeInTheDocument();
  });
});
