import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { notFoundTranslations } from "@/i18n/notfound";

const NotFound = () => {
  const location = useLocation();
  const t = useTranslation(notFoundTranslations);

  usePageMeta({ title: t.title, noindex: true });

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative z-10 text-center px-4 max-w-md mx-auto">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-warning/10 text-warning mb-4 mx-auto">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <Badge variant="outline" className="mb-8 text-muted-foreground">
          {t.badge}
        </Badge>

        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          {t.title}
        </h1>
        
        <p className="text-muted-foreground text-lg mb-2">
          <code className="text-sm bg-muted px-2 py-1 rounded">{location.pathname}</code> {t.description}
        </p>
        <p className="text-muted-foreground mb-8">
          {t.hint}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="executive" size="lg" className="w-full sm:w-auto gap-2">
              <Home className="h-4 w-4" />
              {t.home}
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
