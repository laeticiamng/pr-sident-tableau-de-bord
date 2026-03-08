import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/usePermissions";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: roles, isLoading: rolesLoading } = useUserRoles();

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Check that user has at least one role (owner, admin, or any functional role)
  const hasAnyRole = roles && roles.length > 0;

  if (!hasAnyRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md space-y-4">
          <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">Accès non autorisé</h1>
          <p className="text-muted-foreground text-sm">
            Votre compte n'a pas les permissions nécessaires pour accéder au tableau de bord.
            Contactez l'administrateur pour obtenir un rôle.
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
