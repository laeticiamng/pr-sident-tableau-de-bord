import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
    session: { user: { id: "user-123" } },
    loading: false,
  }),
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ role: "owner" }],
          error: null,
        }),
      }),
    }),
    rpc: vi.fn().mockResolvedValue({
      data: [
        { resource: "finance", action: "view" },
        { resource: "finance", action: "edit" },
      ],
      error: null,
    }),
  },
}));

// Create a wrapper with QueryClientProvider
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

describe("usePermissions exports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export usePermissions function", async () => {
    const { usePermissions } = await import("@/hooks/usePermissions");
    expect(typeof usePermissions).toBe("function");
  });

  it("should export useUserRoles function", async () => {
    const { useUserRoles } = await import("@/hooks/usePermissions");
    expect(typeof useUserRoles).toBe("function");
  });

  it("should export useHasPermission function", async () => {
    const { useHasPermission } = await import("@/hooks/usePermissions");
    expect(typeof useHasPermission).toBe("function");
  });

  it("should export useCanAccessModule function", async () => {
    const { useCanAccessModule } = await import("@/hooks/usePermissions");
    expect(typeof useCanAccessModule).toBe("function");
  });

  it("should export useCanEditModule function", async () => {
    const { useCanEditModule } = await import("@/hooks/usePermissions");
    expect(typeof useCanEditModule).toBe("function");
  });
});

describe("ROLE_LABELS", () => {
  it("should have labels for all roles", async () => {
    const { ROLE_LABELS } = await import("@/hooks/usePermissions");
    const roles = ["owner", "admin", "finance", "marketing", "support", "product", "engineering", "viewer"];

    roles.forEach(role => {
      expect(ROLE_LABELS[role as keyof typeof ROLE_LABELS]).toBeDefined();
      expect(typeof ROLE_LABELS[role as keyof typeof ROLE_LABELS]).toBe("string");
    });
  });

  it("should have French labels", async () => {
    const { ROLE_LABELS } = await import("@/hooks/usePermissions");
    
    expect(ROLE_LABELS.owner).toBe("Propriétaire");
    expect(ROLE_LABELS.admin).toBe("Administrateur");
    expect(ROLE_LABELS.finance).toBe("Finance");
  });
});

describe("ROLE_COLORS", () => {
  it("should have color classes for all roles", async () => {
    const { ROLE_COLORS } = await import("@/hooks/usePermissions");
    const roles = ["owner", "admin", "finance", "marketing", "support", "product", "engineering", "viewer"];

    roles.forEach(role => {
      expect(ROLE_COLORS[role as keyof typeof ROLE_COLORS]).toBeDefined();
      expect(ROLE_COLORS[role as keyof typeof ROLE_COLORS]).toContain("bg-");
    });
  });
});

describe("useUserRoles", () => {
  it("should return roles data", async () => {
    const { useUserRoles } = await import("@/hooks/usePermissions");
    
    const { result } = renderHook(() => useUserRoles(), {
      wrapper: createWrapper(),
    });

    // Should have isLoading property
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("data");
  });
});

describe("usePermissions", () => {
  it("should return permissions structure", async () => {
    const { usePermissions } = await import("@/hooks/usePermissions");
    
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty("roles");
    expect(result.current).toHaveProperty("permissions");
    expect(result.current).toHaveProperty("isOwner");
    expect(result.current).toHaveProperty("isAdmin");
    expect(result.current).toHaveProperty("isLoading");
  });
});
