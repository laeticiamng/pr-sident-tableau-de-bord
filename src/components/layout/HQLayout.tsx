import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HQSidebar } from "./HQSidebar";
import { MobileHQHeader } from "./MobileHQHeader";
import { useAuth } from "@/hooks/useAuth";
import { CommandPalette } from "@/components/hq/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/hq/NotificationCenter";
import { RunQueueWidget } from "@/components/hq/RunQueueWidget";
import { RunTemplateDialog } from "@/components/hq/RunTemplateDialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRunQueue } from "@/hooks/useRunQueue";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function HQLayout() {
  const { user } = useAuth();

  usePageMeta({ title: "HQ", noindex: true });
  const [commandOpen, setCommandOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { enqueue } = useRunQueue();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Les raccourcis clavier restent fonctionnels pour les utilisateurs avancés
  useKeyboardShortcuts({
    onBrief: () => enqueue("DAILY_EXECUTIVE_BRIEF"),
    onAudit: () => enqueue("SECURITY_AUDIT_RLS"),
    onMarketing: () => enqueue("MARKETING_WEEK_PLAN"),
    onCompetitive: () => enqueue("COMPETITIVE_ANALYSIS"),
  });

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Mobile Header */}
      <MobileHQHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Sidebar */}
      <HQSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Command Palette (accessible via Cmd+K pour utilisateurs avancés) */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Barre supérieure simplifiée — Desktop only */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Connecté(e) : {user?.email}
            </p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationCenter />
            </div>
          </div>

          {/* File d'attente des runs (uniquement si des runs sont en cours) */}
          <RunQueueWidget className="mb-4 lg:mb-6" compact />

          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Template Dialog (accessible via Command Palette) */}
      <RunTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
    </div>
  );
}
