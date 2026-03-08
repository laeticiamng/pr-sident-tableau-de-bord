import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { Breadcrumb } from "./Breadcrumb";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
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
