import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { MemoryRouter } from "react-router-dom";

// Track mock return values
let mockUser: { id: string; email: string } | null = { id: "user-viewer", email: "viewer@test.com" };
let mockLoading = false;
let mockCanAccess = false;

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    session: mockUser ? { user: mockUser } : null,
    loading: mockLoading,
  }),
}));

// Mock usePermissions — useCanAccessModule
vi.mock("@/hooks/usePermissions", () => ({
  useCanAccessModule: () => mockCanAccess,
  useHasPermission: () => mockCanAccess,
  usePermissions: () => ({
    roles: mockCanAccess ? ["owner"] : ["viewer"],
    permissions: mockCanAccess ? [{ resource: "finance", action: "view" }] : [],
    isOwner: mockCanAccess,
    isAdmin: mockCanAccess,
    isLoading: false,
  }),
  useUserRoles: () => ({ data: mockCanAccess ? ["owner"] : ["viewer"], isLoading: false }),
  ROLE_LABELS: { owner: "Propriétaire", viewer: "Lecteur", admin: "Admin", finance: "Finance", marketing: "Marketing", support: "Support", product: "Produit", engineering: "Ingénierie" },
  ROLE_COLORS: { owner: "bg-primary", viewer: "bg-muted", admin: "bg-destructive", finance: "bg-success", marketing: "bg-accent", support: "bg-primary/80", product: "bg-warning", engineering: "bg-muted-foreground" },
}));

import { ModuleGuard } from "@/components/auth/ModuleGuard";

describe("ModuleGuard", () => {
  beforeEach(() => {
    mockUser = { id: "user-viewer", email: "viewer@test.com" };
    mockLoading = false;
    mockCanAccess = false;
  });

  it("shows loading spinner when auth is loading", () => {
    mockLoading = true;
    render(
      <MemoryRouter>
        <ModuleGuard module="finance">
          <div>Finance Content</div>
        </ModuleGuard>
      </MemoryRouter>
    );
    // Should show spinner, not content
    expect(screen.queryByText("Finance Content")).not.toBeInTheDocument();
  });

  it("redirects to /auth when user is not logged in", () => {
    mockUser = null;
    render(
      <MemoryRouter>
        <ModuleGuard module="finance">
          <div>Finance Content</div>
        </ModuleGuard>
      </MemoryRouter>
    );
    // Content should not be visible — Navigate to /auth
    expect(screen.queryByText("Finance Content")).not.toBeInTheDocument();
  });

  it("shows 'Accès restreint' when user lacks module permission", () => {
    mockCanAccess = false;
    render(
      <MemoryRouter>
        <ModuleGuard module="finance">
          <div>Finance Content</div>
        </ModuleGuard>
      </MemoryRouter>
    );
    expect(screen.getByText("Accès restreint")).toBeInTheDocument();
    expect(screen.queryByText("Finance Content")).not.toBeInTheDocument();
    expect(screen.getByText(/finance/i)).toBeInTheDocument();
    expect(screen.getByText("Retour")).toBeInTheDocument();
  });

  it("renders children when user has module permission (owner)", () => {
    mockCanAccess = true;
    render(
      <MemoryRouter>
        <ModuleGuard module="finance">
          <div>Finance Content</div>
        </ModuleGuard>
      </MemoryRouter>
    );
    expect(screen.getByText("Finance Content")).toBeInTheDocument();
    expect(screen.queryByText("Accès restreint")).not.toBeInTheDocument();
  });

  it("blocks access to security module for viewer role", () => {
    mockCanAccess = false;
    render(
      <MemoryRouter>
        <ModuleGuard module="security">
          <div>Security Dashboard</div>
        </ModuleGuard>
      </MemoryRouter>
    );
    expect(screen.getByText("Accès restreint")).toBeInTheDocument();
    expect(screen.queryByText("Security Dashboard")).not.toBeInTheDocument();
  });
});
