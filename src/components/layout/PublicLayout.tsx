import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { Breadcrumb } from "./Breadcrumb";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AnnouncementBanner } from "@/components/ui/announcement-banner";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner
        variant="topbar"
        tone="premium"
        icon="sparkles"
        message="Nouvelle version disponible — Découvrez nos 10 plateformes SaaS pilotées par IA"
        ctaLabel="En savoir plus"
        ctaHref="/plateformes"
        dismissKey="public-v3-launch"
      />
      <PublicHeader />
      <Breadcrumb />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <CookieConsentBanner />
    </div>
  );
}
