import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">EMOTIONSCARE</span>
                <span className="text-xs text-muted-foreground">SASU</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Siège social numérique pilotant 5 plateformes innovantes. 
              Éditeur de logiciels applicatifs basé à Amiens.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
            <h4 className="font-semibold mb-4">Légal & Conformité</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/legal/mentions" className="hover:text-primary transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/legal/confidentialite" className="hover:text-primary transition-colors">
                  Politique de confidentialité
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
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} EMOTIONSCARE SASU. Tous droits réservés.</p>
            <p>SIREN : 944 505 445 | RCS Amiens</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
