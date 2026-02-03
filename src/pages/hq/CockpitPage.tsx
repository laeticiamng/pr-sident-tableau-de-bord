import { ExecutiveCockpit } from "@/components/hq/ExecutiveCockpit";
import { EssentialCockpit } from "@/components/hq/EssentialCockpit";
import { AutopilotControl } from "@/components/hq/AutopilotControl";
import { AITransparencyPanel } from "@/components/hq/AITransparencyPanel";
import { SchedulerPanel } from "@/components/hq/SchedulerPanel";
import { AICostWidget } from "@/components/hq/AICostWidget";
import { EssentialModeToggle, useEssentialMode } from "@/components/hq/EssentialModeToggle";

export default function CockpitPage() {
  const { isEssential } = useEssentialMode();

  // Mode essentiel : vue simplifiée pour dirigeant non technique
  if (isEssential) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-1 mb-2">Cockpit Dirigeant</h1>
            <p className="text-muted-foreground text-lg">
              Vue simplifiée des indicateurs clés
            </p>
          </div>
          <EssentialModeToggle />
        </div>
        
        <EssentialCockpit />
      </div>
    );
  }

  // Mode complet : toutes les fonctionnalités
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-1 mb-2">Cockpit Dirigeant</h1>
          <p className="text-muted-foreground text-lg">
            Vue consolidée des KPIs et contrôle opérationnel des 5 plateformes.
          </p>
        </div>
        <EssentialModeToggle />
      </div>

      {/* Control Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <AutopilotControl />
        <SchedulerPanel />
        <AICostWidget />
      </div>

      {/* Executive Cockpit */}
      <ExecutiveCockpit />

      {/* AI Transparency */}
      <AITransparencyPanel />
    </div>
  );
}
