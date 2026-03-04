import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/contexts/LanguageContext";
import { commonTranslations } from "@/i18n/common";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const t = useTranslation(commonTranslations);

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold tracking-tight">EMOTIONSCARE</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">{t.footer.softwareEditor}</span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t.footer.theme} :</span>
              <ThemeToggle variant="minimal" />
            </div>
          </div>

          <div>
            <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">{t.footer.navigation}</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">{t.nav.home}</Link></li>
              <li><Link to="/plateformes" className="hover:text-primary transition-colors">{t.nav.platforms}</Link></li>
              <li><Link to="/status" className="hover:text-primary transition-colors">{t.nav.status}</Link></li>
              <li><Link to="/vision" className="hover:text-primary transition-colors">{t.nav.vision}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t.nav.contact}</Link></li>
              <li><Link to="/trust" className="hover:text-primary transition-colors">{t.nav.security}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><Link to="/legal/mentions" className="hover:text-primary transition-colors">{t.footer.legalNotice}</Link></li>
              <li><Link to="/legal/confidentialite" className="hover:text-primary transition-colors">{t.footer.privacy}</Link></li>
              <li><Link to="/legal/cgv" className="hover:text-primary transition-colors">{t.footer.terms}</Link></li>
              <li><Link to="/legal/rgpd" className="hover:text-primary transition-colors">{t.footer.rgpdRegistry}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>© {currentYear} EMOTIONSCARE SASU. {t.footer.allRights}</p>
            <p>SIREN : 944 505 445 | RCS Amiens</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
