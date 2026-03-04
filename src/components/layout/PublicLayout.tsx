import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export function PublicLayout() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <PublicFooter />
      </div>
      <CookieConsentBanner />
    </LanguageProvider>
  );
}
