import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { breadcrumbTranslations } from "@/i18n/breadcrumb";

const ROUTE_MAP: Record<string, string> = {
  "/": "home",
  "/plateformes": "platforms",
  "/vision": "vision",
  "/trust": "trust",
  "/contact": "contact",
  "/status": "status",
  "/tarifs": "pricing",
  "/legal/mentions": "legalNotice",
  "/legal/confidentialite": "privacy",
  "/legal/cgv": "terms",
  "/legal/rgpd": "rgpd",
  "/legal/cookies": "cookies",
};

export function Breadcrumb() {
  const location = useLocation();
  const t = useTranslation(breadcrumbTranslations);
  const path = location.pathname;

  // Don't show breadcrumb on homepage
  if (path === "/") return null;

  const routeKey = ROUTE_MAP[path];
  if (!routeKey) return null;

  const label = t[routeKey as keyof typeof t] as string;
  if (!label) return null;

  // Build parent for legal pages
  const isLegal = path.startsWith("/legal/");

  return (
    <nav aria-label={t.ariaLabel} className="container px-4 sm:px-6 lg:px-8 pt-4">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
        <li className="flex items-center gap-1.5" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1" itemProp="item">
            <Home className="h-3.5 w-3.5" />
            <span itemProp="name">{t.home}</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />

        {isLegal && (
          <>
            <li className="flex items-center gap-1.5" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="text-muted-foreground/70" itemProp="name">{t.legal}</span>
              <meta itemProp="position" content="2" />
            </li>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          </>
        )}

        <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <span className="font-medium text-foreground" itemProp="name">{label}</span>
          <link itemProp="item" href={`https://president-cockpit-hq.lovable.app${path}`} />
          <meta itemProp="position" content={isLegal ? "3" : "2"} />
        </li>
      </ol>
    </nav>
  );
}
