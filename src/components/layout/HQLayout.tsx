import { useState } from "react";
import { Outlet } from "react-router-dom";
import { HQSidebar } from "./HQSidebar";
import { useAuth } from "@/hooks/useAuth";
import { CommandPalette } from "@/components/hq/CommandPalette";
import { LiveStatusWidget } from "@/components/hq/LiveStatusWidget";
import { QuickActionsBar } from "@/components/hq/QuickActionsBar";

export function HQLayout() {
  const { user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <HQSidebar />
      
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      
      <main className="pl-64">
        <div className="p-8">
          {/* Top Bar */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Connecté(e) : {user?.email}
                </p>
              </div>
              <LiveStatusWidget />
            </div>
            
            {/* Quick Actions Bar */}
            <QuickActionsBar onOpenCommand={() => setCommandOpen(true)} />
          </div>
          
          <Outlet />
        </div>
      </main>
    </div>
  );
}
