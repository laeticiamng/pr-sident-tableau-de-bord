import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "owner" | "admin" | "finance" | "marketing" | "support" | "product" | "engineering" | "viewer";

export interface Permission {
  resource: string;
  action: string;
}

export interface UserPermissions {
  roles: AppRole[];
  permissions: Permission[];
  isOwner: boolean;
  isAdmin: boolean;
}

// Role labels for display
export const ROLE_LABELS: Record<AppRole, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  finance: "Finance",
  marketing: "Marketing",
  support: "Support",
  product: "Produit",
  engineering: "Ingénierie",
  viewer: "Lecteur",
};

// Role colors for badges
export const ROLE_COLORS: Record<AppRole, string> = {
  owner: "bg-primary text-primary-foreground",
  admin: "bg-destructive text-destructive-foreground",
  finance: "bg-green-500 text-white",
  marketing: "bg-purple-500 text-white",
  support: "bg-blue-500 text-white",
  product: "bg-orange-500 text-white",
  engineering: "bg-slate-600 text-white",
  viewer: "bg-muted text-muted-foreground",
};

/**
 * Hook to get user roles from the database
 */
export function useUserRoles() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async (): Promise<AppRole[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("[useUserRoles] Error:", error);
        return [];
      }
      
      return (data || []).map(r => r.role as AppRole);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get user permissions based on their roles
 */
export function usePermissions(): UserPermissions & { isLoading: boolean } {
  const { user } = useAuth();
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles();
  
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async (): Promise<Permission[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc("get_user_permissions", {
        _user_id: user.id,
      });
      
      if (error) {
        console.error("[usePermissions] Error:", error);
        return [];
      }
      
      return (data || []) as Permission[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const isOwner = roles.includes("owner");
  const isAdmin = roles.includes("admin") || isOwner;
  
  return {
    roles,
    permissions,
    isOwner,
    isAdmin,
    isLoading: rolesLoading || permissionsLoading,
  };
}

/**
 * Check if user has a specific permission
 */
export function useHasPermission(resource: string, action: string): boolean {
  const { permissions, isOwner } = usePermissions();
  
  if (isOwner) return true;
  
  return permissions.some(p => p.resource === resource && p.action === action);
}

/**
 * Check if user can access a specific module
 */
export function useCanAccessModule(module: string): boolean {
  return useHasPermission(module, "view");
}

/**
 * Check if user can edit a specific module
 */
export function useCanEditModule(module: string): boolean {
  return useHasPermission(module, "edit");
}
