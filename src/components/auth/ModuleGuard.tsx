import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCanAccessModule } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleGuardProps {
  module: string;
  children: ReactNode;
}

/**
 * Route-level RBAC guard — verifies user can access a specific module.
 * Owner always has access. Other roles need "view" permission on the module.
 */
export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { user, loading } = useAuth();
  const canAccess = useCanAccessModule(module);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md space-y-4">
          <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Accès restreint</h2>
          <p className="text-muted-foreground text-sm">
            Vous n'avez pas les permissions nécessaires pour accéder au module <strong>{module}</strong>.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
