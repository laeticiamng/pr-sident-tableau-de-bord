import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import React from "react";

// Must mock before importing the component
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@/hooks/useHQData", () => ({
  useExecuteRun: () => ({
    mutate: vi.fn(),
    isPending: false,
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
      React.createElement(BrowserRouter, null, children)
    );
  };
};

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export CommandPalette component", async () => {
    const { CommandPalette } = await import("@/components/hq/CommandPalette");
    expect(CommandPalette).toBeDefined();
  });

  it("should render when open is true", async () => {
    const { CommandPalette } = await import("@/components/hq/CommandPalette");
    
    render(
      <CommandPalette open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  it("should not render dialog content when open is false", async () => {
    const { CommandPalette } = await import("@/components/hq/CommandPalette");
    
    render(
      <CommandPalette open={false} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByPlaceholderText(/rechercher/i)).not.toBeInTheDocument();
  });

  it("should display navigation items when open", async () => {
    const { CommandPalette } = await import("@/components/hq/CommandPalette");
    
    render(
      <CommandPalette open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Briefing Room")).toBeInTheDocument();
    expect(screen.getByText("Cockpit Dirigeant")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
  });

  it("should display AI run items when open", async () => {
    const { CommandPalette } = await import("@/components/hq/CommandPalette");
    
    render(
      <CommandPalette open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Brief Exécutif Quotidien")).toBeInTheDocument();
    expect(screen.getByText("Audit Sécurité RLS")).toBeInTheDocument();
  });

  it("should display keyboard shortcut hint", async () => {
    const { CommandPalette } = await import("@/components/hq/CommandPalette");
    
    render(
      <CommandPalette open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/⌘K ou Ctrl\+K/)).toBeInTheDocument();
  });

  it("should display command groups", async () => {
    const { CommandPalette } = await import("@/components/hq/CommandPalette");
    
    render(
      <CommandPalette open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Actions IA Rapides")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  it("should call onOpenChange when Escape is pressed", async () => {
    const { CommandPalette } = await import("@/components/hq/CommandPalette");
    const onOpenChange = vi.fn();
    
    render(
      <CommandPalette open={true} onOpenChange={onOpenChange} />,
      { wrapper: createWrapper() }
    );

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
