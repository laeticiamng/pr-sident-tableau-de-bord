import { ExecutiveCockpit } from "@/components/hq/ExecutiveCockpit";
import { AutopilotControl } from "@/components/hq/AutopilotControl";
import { AITransparencyPanel } from "@/components/hq/AITransparencyPanel";

export default function CockpitPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Cockpit Dirigeant</h1>
        <p className="text-muted-foreground text-lg">
          Vue consolidée des KPIs et contrôle opérationnel des 5 plateformes.
        </p>
      </div>

      {/* Autopilot Control */}
      <AutopilotControl />

      {/* Executive Cockpit */}
      <ExecutiveCockpit />

      {/* AI Transparency */}
      <AITransparencyPanel />
    </div>
  );
}
