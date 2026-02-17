import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  LayoutDashboard,
  Gauge,
  Crosshair,
  Layers,
  Users,
  Calendar,
  CheckSquare,
  History,
  Shield,
  TrendingUp,
  DollarSign,
  Package,
  Settings,
  FileText,
  LogOut,
  ChevronRight,
  Briefcase,
  HeadphonesIcon,
  Activity,
  Bot,
  Scale,
  BarChart3,
  X,
  Rocket,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    label: "Cockpit",
    items: [
      { href: "/hq", label: "Briefing Room", icon: LayoutDashboard },
      { href: "/hq/cockpit", label: "Cockpit Dirigeant", icon: Gauge },
      { href: "/hq/cos", label: "COS — Pilotage", icon: Crosshair },
      { href: "/hq/plateformes", label: "Plateformes", icon: Layers },
      { href: "/hq/equipe-executive", label: "Workforce Growth Copilot", icon: Users },
      { href: "/hq/growth", label: "Growth OS", icon: Rocket },
    ],
  },
  {
    label: "Opérations",
    items: [
      { href: "/hq/reunions", label: "Réunions", icon: Calendar },
      { href: "/hq/approbations", label: "Approbations", icon: CheckSquare },
      { href: "/hq/historique", label: "Historique Runs", icon: History },
    ],
  },
  {
    label: "Fonctions",
    items: [
      { href: "/hq/securite", label: "Sécurité", icon: Shield },
      { href: "/hq/marketing", label: "Marketing", icon: TrendingUp },
      { href: "/hq/ventes", label: "Ventes", icon: Briefcase },
      { href: "/hq/finance", label: "Finance", icon: DollarSign },
      { href: "/hq/produit", label: "Produit", icon: Package },
      { href: "/hq/engineering", label: "Engineering", icon: Settings },
      { href: "/hq/support", label: "Support", icon: HeadphonesIcon },
      { href: "/hq/veille", label: "Veille Stratégique", icon: Eye },
    ],
  },
  {
    label: "Gouvernance",
    items: [
      { href: "/hq/audit", label: "Audit Log", icon: FileText },
      { href: "/hq/entreprise", label: "Profil Entreprise", icon: Building2 },
      { href: "/hq/diagnostics", label: "Diagnostics", icon: Activity },
      { href: "/hq/rh", label: "Ressources & Agents", icon: Bot },
      { href: "/hq/conformite", label: "Conformité RGPD", icon: Scale },
      { href: "/hq/data", label: "Data & Analytics", icon: BarChart3 },
      { href: "/hq/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

interface HQSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function HQSidebar({ isOpen = true, onClose }: HQSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
          // Mobile: slide in/out
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Mobile: account for header
          "pt-14 lg:pt-0"
        )}
      >
        {/* Logo - Desktop only */}
        <div className="hidden lg:block p-6 border-b border-sidebar-border">
          <Link to="/hq" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">EMOTIONSCARE</span>
              <span className="text-xs text-sidebar-foreground/60">Siège Social</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {sidebarLinks.map((section) => (
            <div key={section.label}>
              <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.label}
              </div>
              <ul className="space-y-1">
                {section.items.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <link.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{link.label}</span>
                        {isActive && <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleLinkClick();
              signOut();
            }}
            className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}
