import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/usePermissions";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const texts = {
  fr: { unauthorized: "Accès non autorisé", noRole: "Votre compte n'a pas les permissions nécessaires pour accéder au tableau de bord. Contactez l'administrateur pour obtenir un rôle.", backHome: "Retour à l'accueil" },
  en: { unauthorized: "Unauthorized access", noRole: "Your account does not have the necessary permissions to access the dashboard. Contact the administrator to get a role.", backHome: "Back to home" },
  de: { unauthorized: "Unbefugter Zugriff", noRole: "Ihr Konto verfügt nicht über die erforderlichen Berechtigungen für den Zugriff auf das Dashboard. Kontaktieren Sie den Administrator.", backHome: "Zurück zur Startseite" },
} as const;

function getTexts() {
  const lang = (typeof localStorage !== "undefined" && localStorage.getItem("preferred-lang")) || "fr";
  return texts[lang as keyof typeof texts] || texts.fr;
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const hasAnyRole = roles && roles.length > 0;

  if (!hasAnyRole) {
    const t = getTexts();
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md space-y-4">
          <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">{t.unauthorized}</h1>
          <p className="text-muted-foreground text-sm">{t.noRole}</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            {t.backHome}
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
