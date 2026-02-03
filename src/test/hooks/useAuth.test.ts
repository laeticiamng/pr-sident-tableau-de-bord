import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock Supabase client at module level
vi.mock("@/integrations/supabase/client", () => {
  const mockSession = { user: { id: "user-123", email: "test@example.com" } };
  
  return {
    supabase: {
      auth: {
        onAuthStateChange: vi.fn((callback) => {
          // Immediately call with session
          setTimeout(() => callback("SIGNED_IN", mockSession), 0);
          return {
            data: { subscription: { unsubscribe: vi.fn() } },
          };
        }),
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/test" }),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export useAuth function", async () => {
    const { useAuth } = await import("@/hooks/useAuth");
    expect(typeof useAuth).toBe("function");
  });

  it("should return user, session, loading, and signOut", async () => {
    const { useAuth } = await import("@/hooks/useAuth");
    
    const { result } = renderHook(() => useAuth());

    // Wait for state updates to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Check initial structure
    expect(result.current).toHaveProperty("user");
    expect(result.current).toHaveProperty("session");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("signOut");
  });

  it("should have signOut as a function", async () => {
    const { useAuth } = await import("@/hooks/useAuth");
    
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(typeof result.current.signOut).toBe("function");
  });
});

describe("useRequireAuth", () => {
  it("should export useRequireAuth function", async () => {
    const { useRequireAuth } = await import("@/hooks/useAuth");
    expect(typeof useRequireAuth).toBe("function");
  });

  it("should return user and loading", async () => {
    const { useRequireAuth } = await import("@/hooks/useAuth");
    
    const { result } = renderHook(() => useRequireAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current).toHaveProperty("user");
    expect(result.current).toHaveProperty("loading");
  });
});
