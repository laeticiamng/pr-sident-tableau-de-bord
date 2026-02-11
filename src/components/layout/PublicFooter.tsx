import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold tracking-tight">EMOTIONSCARE</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Éditeur de logiciels</span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4">
              Siège social numérique pilotant 7 plateformes innovantes. 
              Éditeur de logiciels applicatifs basé à Amiens.
            </p>
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Thème :</span>
              <ThemeToggle variant="minimal" />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Navigation</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/plateformes" className="hover:text-primary transition-colors">
                  Plateformes
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-primary transition-colors">
                  Statut
                </Link>
              </li>
              <li>
                <Link to="/vision" className="hover:text-primary transition-colors">
                  Vision
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Légal</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/legal/mentions" className="hover:text-primary transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/legal/confidentialite" className="hover:text-primary transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link to="/legal/cgv" className="hover:text-primary transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link to="/legal/rgpd" className="hover:text-primary transition-colors">
                  Registre RGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>© {currentYear} EMOTIONSCARE SASU. Tous droits réservés.</p>
            <p>SIREN : 944 505 445 | RCS Amiens</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
