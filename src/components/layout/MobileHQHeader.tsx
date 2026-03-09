import { Link } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/hq/NotificationCenter";
import { useTranslation } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

interface MobileHQHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function MobileHQHeader({ sidebarOpen, onToggleSidebar }: MobileHQHeaderProps) {
  const t = useTranslation(hqCommon);
  
  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-3 sm:px-4 safe-top"
      style={{ height: `calc(3.5rem + env(safe-area-inset-top, 0px))`, paddingTop: `env(safe-area-inset-top, 0px)` }}
    >
      <button
        onClick={onToggleSidebar}
        className="p-2.5 -ml-1 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
        aria-label={sidebarOpen ? t.closeMenu : t.openMenu}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <Link to="/hq" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="text-xs font-bold text-sidebar-foreground tracking-tight">
          EMOTIONSCARE HQ
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <ThemeToggle variant="minimal" className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent" />
        <NotificationCenter />
      </div>
    </header>
  );
}
