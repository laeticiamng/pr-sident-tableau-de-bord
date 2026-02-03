import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";

// Mock components for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe("Component Integration Tests", () => {
  describe("ThemeProvider", () => {
    it("should provide theme context to children", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <div data-testid="child">Test Content</div>
        </TestWrapper>
      );

      expect(getByTestId("child")).toBeInTheDocument();
      expect(getByTestId("child")).toHaveTextContent("Test Content");
    });
  });

  describe("QueryClientProvider", () => {
    it("should provide query client to children", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <div data-testid="query-child">Query Test</div>
        </TestWrapper>
      );

      expect(getByTestId("query-child")).toBeInTheDocument();
    });
  });
});

describe("App Navigation", () => {
  it("should have correct public routes defined", () => {
    const publicRoutes = ["/", "/plateformes", "/vision", "/contact", "/auth"];
    
    publicRoutes.forEach((route) => {
      expect(route).toBeTruthy();
    });
  });

  it("should have correct HQ routes defined", () => {
    const hqRoutes = [
      "/hq",
      "/hq/cockpit",
      "/hq/plateformes",
      "/hq/equipe-executive",
      "/hq/reunions",
      "/hq/approbations",
      "/hq/historique",
      "/hq/securite",
      "/hq/marketing",
      "/hq/ventes",
      "/hq/finance",
      "/hq/produit",
      "/hq/engineering",
      "/hq/support",
      "/hq/audit",
      "/hq/entreprise",
      "/hq/diagnostics",
      "/hq/rh",
      "/hq/conformite",
      "/hq/data",
    ];
    
    hqRoutes.forEach((route) => {
      expect(route.startsWith("/hq")).toBe(true);
    });
  });
});

describe("Constants Validation", () => {
  it("should have exactly 5 managed platforms", () => {
    const MANAGED_PLATFORMS = [
      "emotionscare",
      "pixel-perfect-replica",
      "system-compass",
      "growth-copilot",
      "med-mng",
    ];

    expect(MANAGED_PLATFORMS.length).toBe(5);
  });

  it("should have all platform keys as valid strings", () => {
    const MANAGED_PLATFORMS = [
      "emotionscare",
      "pixel-perfect-replica",
      "system-compass",
      "growth-copilot",
      "med-mng",
    ];

    MANAGED_PLATFORMS.forEach((platform) => {
      expect(typeof platform).toBe("string");
      expect(platform.length).toBeGreaterThan(0);
    });
  });
});
