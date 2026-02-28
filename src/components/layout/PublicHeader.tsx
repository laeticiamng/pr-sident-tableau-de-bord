import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/plateformes", label: "Plateformes" },
  { href: "/status", label: "Statut" },
  { href: "/vision", label: "Vision" },
  { href: "/trust", label: "Sécurité" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-sm border-border"
          : "bg-background/60 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold tracking-tight">EMOTIONSCARE</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Éditeur de logiciels</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors relative py-1",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              {location.pathname === link.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle variant="minimal" className="h-8 w-8 sm:h-9 sm:w-9" />
          
          <Link to="/auth" className="hidden sm:block">
            <Button variant="executive-outline" size="sm" className="text-xs sm:text-sm">
              Connexion
            </Button>
          </Link>
          
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-80 border-t" : "max-h-0"
        )}
      >
        <nav className="container py-4 px-4 flex flex-col gap-2 bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors p-3 rounded-lg",
                location.pathname === link.href
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-2">
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="executive" size="sm" className="w-full">
                Connexion
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
