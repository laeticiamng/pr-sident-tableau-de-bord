import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  LayoutDashboard,
  Layers,
  CheckSquare,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Gauge,
  Crosshair,
  Rocket,
  History,
  Shield,
  TrendingUp,
  Briefcase,
  DollarSign,
  Mail,
  FileText,
  Activity,
  Bot,
  Scale,
  BookOpen,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePendingApprovals, useRecentRuns, usePlatforms, useAuditLogs } from "@/hooks/useHQData";
import { useCanAccessModule } from "@/hooks/usePermissions";

// Items principaux — toujours visibles
const mainLinks = [
  { href: "/hq", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/hq/plateformes", label: "Mes Plateformes", icon: Layers },
  { href: "/hq/approbations", label: "Approbations", icon: CheckSquare, showBadge: true },
  { href: "/hq/journal", label: "Journal", icon: BookOpen },
  { href: "/hq/cockpit", label: "Cockpit", icon: Gauge },
  { href: "/hq/messages", label: "Messages", icon: Mail, showMessagesBadge: true },
  { href: "/hq/settings", label: "Paramètres", icon: Settings },
];

// Items secondaires — regroupés par catégorie
const secondaryGroups = [
  {
    label: "Opérations",
    items: [
      { href: "/hq/cos", label: "COS — Pilotage", icon: Crosshair },
      { href: "/hq/agents-monitoring", label: "Agents IA", icon: Bot, showFailedBadge: true },
      { href: "/hq/historique", label: "Historique Runs", icon: History },
      { href: "/hq/diagnostics", label: "Diagnostics", icon: Activity },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/hq/finance", label: "Finance", icon: DollarSign },
      { href: "/hq/ventes", label: "Ventes", icon: Briefcase },
      { href: "/hq/marketing", label: "Marketing", icon: TrendingUp },
      { href: "/hq/growth", label: "Growth OS", icon: Rocket },
    ],
  },
  {
    label: "Gouvernance",
    items: [
      { href: "/hq/securite", label: "Sécurité", icon: Shield },
      { href: "/hq/conformite", label: "Conformité RGPD", icon: Scale },
      { href: "/hq/audit", label: "Audit Log", icon: FileText },
      { href: "/hq/entreprise", label: "Entreprise", icon: Building2 },
    ],
  },
];

// Flatten for route matching
const allSecondaryLinks = secondaryGroups.flatMap(g => g.items);

interface HQSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCommandOpen?: () => void;
}

export function HQSidebar({ isOpen = true, onClose, onCommandOpen }: HQSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: pendingApprovals } = usePendingApprovals();
  const { data: recentRuns } = useRecentRuns(50);
  const { data: platforms } = usePlatforms();
  const { data: auditLogs } = useAuditLogs(50);
  const { data: unreadMessagesCount } = useQuery({
    queryKey: ["contact-messages-unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (error) return 0;
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });
  const [showMore, setShowMore] = useState(false);

  const pendingCount = pendingApprovals?.length || 0;
  const failedRunsCount = recentRuns?.filter(r => {
    const d = new Date(r.created_at);
    return r.status === "failed" && Date.now() - d.getTime() < 24 * 3600 * 1000;
  }).length || 0;

  // Section counters
  const platformAlertCount = platforms?.filter(p => p.status === "red" || p.status === "amber").length || 0;
  const runningCount = recentRuns?.filter(r => r.status === "running" || r.status === "pending").length || 0;
  const opsCount = failedRunsCount + runningCount;
  const recentAuditCount = auditLogs?.filter(l => {
    const d = new Date(l.created_at);
    return Date.now() - d.getTime() < 24 * 3600 * 1000;
  }).length || 0;

  const isOnSecondaryPage = allSecondaryLinks.some(link => location.pathname === link.href);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const isExpanded = showMore || isOnSecondaryPage;

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
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "pt-14 lg:pt-0"
        )}
      >
        {/* Logo - Desktop only */}
        <div className="hidden lg:block p-5 border-b border-sidebar-border">
          <Link to="/hq" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">EMOTIONSCARE</span>
              <span className="text-[11px] text-sidebar-foreground/50">Siège Social</span>
            </div>
          </Link>
        </div>

        {/* Command Search Bar — 21st.dev pattern */}
        <div className="hidden lg:block px-4 pt-4 pb-2">
          <button
            onClick={onCommandOpen}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground/50 text-sm hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/70 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left text-xs">Rechercher…</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/40">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {/* Section principale */}
          <div className="px-3 mb-2 mt-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Principal
          </div>
          <ul className="space-y-0.5">
            {mainLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const hasBadge = (link.showBadge && pendingCount > 0) ||
                ("showMessagesBadge" in link && link.showMessagesBadge && (unreadMessagesCount ?? 0) > 0) ||
                (link.href === "/hq/plateformes" && platformAlertCount > 0);

              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-1">{link.label}</span>
                    {/* 21st.dev-style right-aligned count */}
                    {link.showBadge && pendingCount > 0 && (
                      <span className="text-[11px] font-medium tabular-nums text-destructive">
                        {pendingCount}
                      </span>
                    )}
                    {"showMessagesBadge" in link && link.showMessagesBadge && (unreadMessagesCount ?? 0) > 0 && (
                      <span className="text-[11px] font-medium tabular-nums text-destructive">
                        {unreadMessagesCount}
                      </span>
                    )}
                    {link.href === "/hq/plateformes" && platformAlertCount > 0 && (
                      <span className="text-[11px] font-medium tabular-nums text-warning">
                        {platformAlertCount}
                      </span>
                    )}
                    {isActive && !hasBadge && (
                      <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0 opacity-50" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Séparateur + section repliable */}
          <div className="pt-3">
            <button
              onClick={() => setShowMore(!isExpanded)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
            >
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
              <span className="flex-1 text-left">Tous les services</span>
              {!isExpanded && (opsCount + recentAuditCount) > 0 && (
                <span className="text-[10px] tabular-nums text-sidebar-foreground/30">
                  {opsCount + recentAuditCount}
                </span>
              )}
            </button>

            {isExpanded && (
              <div className="mt-1 space-y-3 animate-fade-in">
                {secondaryGroups.map((group) => {
                  const groupCount = group.label === "Opérations" ? opsCount
                    : group.label === "Gouvernance" ? recentAuditCount
                    : 0;

                  return (
                    <div key={group.label}>
                      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/35 flex items-center justify-between">
                        <span>{group.label}</span>
                        {groupCount > 0 && (
                          <span className="text-[10px] tabular-nums font-medium text-sidebar-foreground/50">
                            {groupCount}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-0.5">
                        {group.items.map((link) => {
                          const isActive = location.pathname === link.href;
                          return (
                            <li key={link.href}>
                              <Link
                                to={link.href}
                                onClick={handleLinkClick}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-150",
                                  isActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                    : "text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                )}
                              >
                                <link.icon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate flex-1">{link.label}</span>
                                {"showFailedBadge" in link && link.showFailedBadge && failedRunsCount > 0 && (
                                  <span className="text-[11px] font-medium tabular-nums text-destructive">
                                    {failedRunsCount}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleLinkClick();
              signOut();
            }}
            className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent text-[13px]"
          >
            <LogOut className="h-3.5 w-3.5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}
