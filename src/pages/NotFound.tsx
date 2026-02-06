import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page introuvable — EMOTIONSCARE SASU";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative z-10 text-center px-4 max-w-md mx-auto">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-warning/10 text-warning mb-4">
          <AlertTriangle className="h-10 w-10" />
        </div>

        {/* Badge */}
        <Badge variant="outline" className="mb-8 text-muted-foreground">
          Erreur 404
        </Badge>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Page introuvable
        </h1>
        
        {/* Description */}
        <p className="text-muted-foreground text-lg mb-2">
          La page <code className="text-sm bg-muted px-2 py-1 rounded">{location.pathname}</code> n'existe pas.
        </p>
        <p className="text-muted-foreground mb-8">
          Vérifiez l'URL ou retournez à l'accueil.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="executive" size="lg" className="w-full sm:w-auto gap-2">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Page précédente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
