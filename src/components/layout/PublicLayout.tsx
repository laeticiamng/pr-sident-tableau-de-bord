import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { Breadcrumb } from "./Breadcrumb";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip-to-content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
      >
        Aller au contenu principal
      </a>
      <PublicHeader />
      <Breadcrumb />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      <PublicFooter />
      <CookieConsentBanner />
    </div>
  );
}
