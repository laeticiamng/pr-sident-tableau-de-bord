import { Outlet } from "react-router-dom";
import { HQSidebar } from "./HQSidebar";
import { useAuth } from "@/hooks/useAuth";

export function HQLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <HQSidebar />
      <main className="pl-64">
        <div className="p-8">
          {/* Top Bar */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Connecté(e) : {user?.email}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
