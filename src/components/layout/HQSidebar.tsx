import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePendingApprovals, useRecentRuns, usePlatforms, useAuditLogs } from "@/hooks/useHQData";
import { useTranslation } from "@/contexts/LanguageContext";
import { sidebarTranslations } from "@/i18n/sidebar";

interface HQSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCommandOpen?: () => void;
}

export function HQSidebar({ isOpen = true, onClose, onCommandOpen }: HQSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const t = useTranslation(sidebarTranslations);

  const mainLinks = [
    { href: "/hq", label: t.dashboard, icon: LayoutDashboard },
    { href: "/hq/plateformes", label: t.platforms, icon: Layers },
    { href: "/hq/approbations", label: t.approvals, icon: CheckSquare, showBadge: true },
    { href: "/hq/journal", label: t.journal, icon: BookOpen },
    { href: "/hq/cockpit", label: t.cockpit, icon: Gauge },
    { href: "/hq/messages", label: t.messages, icon: Mail, showMessagesBadge: true },
    { href: "/hq/utilisateurs", label: t.users, icon: Users },
    { href: "/hq/settings", label: t.settings, icon: Settings },
  ];

  const secondaryGroups = [
    {
      label: t.operations,
      items: [
        { href: "/hq/cos", label: t.cos, icon: Crosshair },
        { href: "/hq/agents-monitoring", label: t.aiAgents, icon: Bot, showFailedBadge: true },
        { href: "/hq/historique", label: t.runHistory, icon: History },
        { href: "/hq/diagnostics", label: t.diagnostics, icon: Activity },
      ],
    },
    {
      label: t.business,
      items: [
        { href: "/hq/finance", label: t.finance, icon: DollarSign },
        { href: "/hq/ventes", label: t.sales, icon: Briefcase },
        { href: "/hq/marketing", label: t.marketing, icon: TrendingUp },
        { href: "/hq/growth", label: t.growthOS, icon: Rocket },
      ],
    },
    {
      label: t.governance,
      items: [
        { href: "/hq/securite", label: t.security, icon: Shield },
        { href: "/hq/conformite", label: t.compliance, icon: Scale },
        { href: "/hq/audit", label: t.auditLog, icon: FileText },
        { href: "/hq/entreprise", label: t.enterprise, icon: Building2 },
      ],
    },
  ];

  const allSecondaryLinks = secondaryGroups.flatMap(g => g.items);

  const { data: pendingApprovals } = usePendingApprovals();
  const { data: platforms } = usePlatforms();
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

  const isExpanded = showMore || allSecondaryLinks.some(link => location.pathname === link.href);

  const { data: recentRuns } = useRecentRuns(50, isExpanded);
  const { data: auditLogs } = useAuditLogs(50, isExpanded);

  const pendingCount = pendingApprovals?.length || 0;
  const failedRunsCount = recentRuns?.filter(r => {
    const d = new Date(r.created_at);
    return r.status === "failed" && Date.now() - d.getTime() < 24 * 3600 * 1000;
  }).length || 0;

  const platformAlertCount = platforms?.filter(p => p.status === "red" || p.status === "amber").length || 0;
  const runningCount = recentRuns?.filter(r => r.status === "running" || r.status === "pending").length || 0;
  const opsCount = failedRunsCount + runningCount;
  const recentAuditCount = auditLogs?.filter(l => {
    const d = new Date(l.created_at);
    return Date.now() - d.getTime() < 24 * 3600 * 1000;
  }).length || 0;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "pt-14 lg:pt-0"
        )}
      >
        <div className="hidden lg:block p-5 border-b border-sidebar-border">
          <Link to="/hq" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">EMOTIONSCARE</span>
              <span className="text-[11px] text-sidebar-foreground/50">{t.hq}</span>
            </div>
          </Link>
        </div>

        <div className="hidden lg:block px-4 pt-4 pb-2">
          <button
            onClick={onCommandOpen}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground/50 text-sm hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/70 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left text-xs">{t.search}</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/40">
              {t.shortcutHint}
            </kbd>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 mb-2 mt-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            {t.main}
          </div>
          <ul className="space-y-0.5">
            {mainLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const hasBadge = ("showBadge" in link && link.showBadge && pendingCount > 0) ||
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
                    {"showBadge" in link && link.showBadge && pendingCount > 0 && (
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

          <div className="pt-3">
            <button
              onClick={() => setShowMore(!isExpanded)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
            >
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
              <span className="flex-1 text-left">{t.allServices}</span>
              {!isExpanded && (opsCount + recentAuditCount) > 0 && (
                <span className="text-[10px] tabular-nums text-sidebar-foreground/30">
                  {opsCount + recentAuditCount}
                </span>
              )}
            </button>

            {isExpanded && (
              <div className="mt-1 space-y-3 animate-fade-in">
                {secondaryGroups.map((group) => {
                  const groupCount = group.label === t.operations ? opsCount
                    : group.label === t.governance ? recentAuditCount
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
            {t.logout}
          </Button>
        </div>
      </aside>
    </>
  );
}
