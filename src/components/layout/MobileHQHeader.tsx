import { Link } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/hq/NotificationCenter";
import { cn } from "@/lib/utils";

interface MobileHQHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function MobileHQHeader({ sidebarOpen, onToggleSidebar }: MobileHQHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
      {/* Menu Toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
        aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Logo */}
      <Link to="/hq" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="text-xs font-bold text-sidebar-foreground tracking-tight">
          EMOTIONSCARE HQ
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle variant="minimal" className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent" />
        <NotificationCenter />
      </div>
    </header>
  );
}
