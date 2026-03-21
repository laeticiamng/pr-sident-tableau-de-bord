import { forwardRef, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Cookie, ArrowRight, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/contexts/LanguageContext";
import { commonTranslations } from "@/i18n/common";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export const PublicFooter = forwardRef<HTMLElement>(function PublicFooter(_, ref) {
  const currentYear = new Date().getFullYear();
  const t = useTranslation(commonTranslations);
  const { reopenBanner } = useCookieConsent();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);

  return (
    <footer ref={ref} className="border-t bg-secondary/30">
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
              <li><Link to="/tarifs" className="hover:text-primary transition-colors">{t.nav.pricing}</Link></li>
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
              <li>
                <button
                  onClick={reopenBanner}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  aria-label={t.footer.cookieSettings}
                >
                  <Cookie className="h-3 w-3" />
                  {t.footer.cookieSettings}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                {t.footer.newsletterTitle}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">{t.footer.newsletterSubtitle}</p>
            </div>
            {newsletterDone ? (
              <div className="flex items-center gap-2 text-sm text-success font-medium">
                <CheckCircle className="h-4 w-4" />
                {t.footer.newsletterSuccess}
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); if (newsletterEmail) setNewsletterDone(true); }}
                className="flex gap-2 w-full sm:w-auto"
              >
                <Input
                  type="email"
                  required
                  placeholder={t.footer.newsletterPlaceholder}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="h-9 text-sm w-full sm:w-56"
                />
                <Button type="submit" variant="executive" size="sm">
                  {t.footer.newsletterButton}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-foreground">{t.footer.ctaTitle}</p>
          <Link to="/plateformes">
            <Button variant="executive" size="sm" className="group">
              {t.footer.ctaButton}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>© {currentYear} EMOTIONSCARE SASU. {t.footer.allRights}</p>
            <p>SIREN : 944 505 445 | RCS Amiens</p>
          </div>
        </div>
      </div>
    </footer>
  );
});
