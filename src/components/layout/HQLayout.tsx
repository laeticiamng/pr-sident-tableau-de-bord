import { useState } from "react";
import { Outlet } from "react-router-dom";
import { HQSidebar } from "./HQSidebar";
import { useAuth } from "@/hooks/useAuth";
import { CommandPalette } from "@/components/hq/CommandPalette";
import { LiveStatusWidget } from "@/components/hq/LiveStatusWidget";
import { QuickActionsBar } from "@/components/hq/QuickActionsBar";
import { FloatingActionButton } from "@/components/hq/FloatingActionButton";
import { ShortcutsHelp } from "@/components/hq/ShortcutsHelp";
import { NotificationCenter } from "@/components/hq/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useExecuteRun } from "@/hooks/useHQData";

export function HQLayout() {
  const { user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const executeRun = useExecuteRun();


  // Register keyboard shortcuts for quick actions
  useKeyboardShortcuts({
    onBrief: () => executeRun.mutate({ run_type: "DAILY_EXECUTIVE_BRIEF" }),
    onAudit: () => executeRun.mutate({ run_type: "SECURITY_AUDIT_RLS" }),
    onMarketing: () => executeRun.mutate({ run_type: "MARKETING_WEEK_PLAN" }),
    onCompetitive: () => executeRun.mutate({ run_type: "COMPETITIVE_ANALYSIS" }),
  });

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <HQSidebar />
      
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      
      <main className="pl-64">
        <div className="p-8">
          {/* Top Bar */}
          <div className="mb-6 flex flex-col gap-4">
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
            <QuickActionsBar onOpenCommand={() => setCommandOpen(true)} />
          </div>
          
          <Outlet />
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
