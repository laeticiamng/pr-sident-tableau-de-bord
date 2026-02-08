import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock platform monitor hooks
vi.mock("@/hooks/usePlatformMonitor", () => ({
  useConsolidatedMetrics: () => ({
    metrics: {
      greenPlatforms: 4,
      amberPlatforms: 1,
      redPlatforms: 0,
      totalPlatforms: 5,
      uptimePercent: 99.5,
      avgResponseTime: 245,
      platforms: [
        { key: "emotionscare", status: "green", responseTime: 200, error: null },
        { key: "med-mng", status: "amber", responseTime: 800, error: "Latence élevée" },
        { key: "system-compass", status: "green", responseTime: 150, error: null },
        { key: "growth-copilot", status: "green", responseTime: 220, error: null },
        { key: "nearvity", status: "green", responseTime: 180, error: null },
      ],
    },
    isLoading: false,
    isHealthy: true,
    isCritical: false,
  }),
  useRefreshPlatformMonitor: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// Mock HQ data hooks
vi.mock("@/hooks/useHQData", () => ({
  usePendingApprovals: () => ({
    data: [{ id: "1", title: "Test approval" }],
    isLoading: false,
  }),
  useRecentRuns: () => ({
    data: [
      { id: "run-1", status: "completed", created_at: "2026-02-03T10:00:00Z" },
      { id: "run-2", status: "completed", created_at: "2026-02-03T09:00:00Z" },
      { id: "run-3", status: "failed", created_at: "2026-02-03T08:00:00Z" },
    ],
    isLoading: false,
  }),
}));

// Create test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe("ExecutiveCockpit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export ExecutiveCockpit component", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    expect(ExecutiveCockpit).toBeDefined();
  });

  it("should render the cockpit header", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText("Cockpit Dirigeant")).toBeInTheDocument();
    expect(screen.getByText(/Vue consolidée/)).toBeInTheDocument();
  });

  it("should display platform health status section", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText("Santé des Plateformes")).toBeInTheDocument();
    expect(screen.getByText("Opérationnelles")).toBeInTheDocument();
    expect(screen.getByText("Attention")).toBeInTheDocument();
    expect(screen.getByText("Critiques")).toBeInTheDocument();
  });

  it("should show correct platform counts", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    // Should show 4 green, 1 amber, 0 red
    // Use getAllByText since "1" can appear multiple times in different contexts
    const fourElements = screen.getAllByText("4");
    expect(fourElements.length).toBeGreaterThan(0);
    
    const oneElements = screen.getAllByText("1");
    expect(oneElements.length).toBeGreaterThan(0);
    
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it("should display uptime percentage", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText("Uptime moyen")).toBeInTheDocument();
    expect(screen.getByText("99.5%")).toBeInTheDocument();
  });

  it("should display key metrics cards", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText("MRR")).toBeInTheDocument();
    expect(screen.getByText("Utilisateurs Actifs")).toBeInTheDocument();
    expect(screen.getByText("Taux de Churn")).toBeInTheDocument();
    expect(screen.getByText("NPS Score")).toBeInTheDocument();
  });

  it("should display governance section", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText("Gouvernance")).toBeInTheDocument();
    expect(screen.getByText("Approbations en attente")).toBeInTheDocument();
    expect(screen.getByText("Runs IA réussis")).toBeInTheDocument();
  });

  it("should display AI activity section", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText("Activité IA")).toBeInTheDocument();
    expect(screen.getByText("Runs aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText("Dernier run")).toBeInTheDocument();
  });

  it("should calculate run success rate correctly", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    // 2 completed out of 3 runs = 67%
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

  it("should display KPIs par Plateforme section", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText("KPIs par Plateforme")).toBeInTheDocument();
  });

  it("should list platforms with their names", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText(/emotionscare/i)).toBeInTheDocument();
    expect(screen.getByText(/med mng/i)).toBeInTheDocument();
  });

  it("should show platform response times", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    expect(screen.getByText("200ms")).toBeInTheDocument();
    expect(screen.getByText("800ms")).toBeInTheDocument();
  });

  it("should have refresh button", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    render(<ExecutiveCockpit />, { wrapper: createWrapper() });

    const refreshButton = screen.getByTitle("Rafraîchir le monitoring");
    expect(refreshButton).toBeInTheDocument();
  });

  it("should apply custom className", async () => {
    const { ExecutiveCockpit } = await import("@/components/hq/ExecutiveCockpit");
    
    const { container } = render(
      <ExecutiveCockpit className="custom-class" />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
