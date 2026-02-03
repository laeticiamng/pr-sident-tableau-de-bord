import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HQSidebar } from "./HQSidebar";
import { MobileHQHeader } from "./MobileHQHeader";
import { useAuth } from "@/hooks/useAuth";
import { CommandPalette } from "@/components/hq/CommandPalette";
import { LiveStatusWidget } from "@/components/hq/LiveStatusWidget";
import { QuickActionsBar } from "@/components/hq/QuickActionsBar";
import { FloatingActionButton } from "@/components/hq/FloatingActionButton";
import { ShortcutsHelp } from "@/components/hq/ShortcutsHelp";
import { NotificationCenter } from "@/components/hq/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RunQueueWidget } from "@/components/hq/RunQueueWidget";
import { RunTemplateDialog } from "@/components/hq/RunTemplateDialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRunQueue } from "@/hooks/useRunQueue";

export function HQLayout() {
  const { user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { enqueue } = useRunQueue();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Register keyboard shortcuts for quick actions
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
      
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Top Bar - Desktop only */}
          <div className="hidden lg:block mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Connecté(e) : {user?.email}
                  </p>
                  <ShortcutsHelp />
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <NotificationCenter />
                  <LiveStatusWidget />
                </div>
              </div>
              
              {/* Quick Actions Bar */}
              <QuickActionsBar 
                onOpenCommand={() => setCommandOpen(true)} 
                onOpenTemplates={() => setTemplateDialogOpen(true)}
              />
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="lg:hidden mb-4">
            <QuickActionsBar 
              onOpenCommand={() => setCommandOpen(true)} 
              onOpenTemplates={() => setTemplateDialogOpen(true)}
              compact
            />
          </div>
          
          {/* Run Queue Widget - shows when runs are in progress */}
          <RunQueueWidget className="mb-4 lg:mb-6" compact />
          
          <Outlet />
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onOpenTemplates={() => setTemplateDialogOpen(true)} />
      
      {/* Template Dialog */}
      <RunTemplateDialog 
        open={templateDialogOpen} 
        onOpenChange={setTemplateDialogOpen} 
      />
    </div>
  );
}
