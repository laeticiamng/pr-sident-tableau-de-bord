import { ExecutiveCockpit } from "@/components/hq/ExecutiveCockpit";
import { EssentialCockpit } from "@/components/hq/EssentialCockpit";
import { AutopilotControl } from "@/components/hq/AutopilotControl";
import { AITransparencyPanel } from "@/components/hq/AITransparencyPanel";
import { SchedulerPanel } from "@/components/hq/SchedulerPanel";
import { AICostWidget } from "@/components/hq/AICostWidget";
import { EssentialModeToggle, useEssentialMode } from "@/components/hq/EssentialModeToggle";
import { PanicSwitch } from "@/components/hq/cockpit/PanicSwitch";
import { KeyMetricsGrid } from "@/components/hq/cockpit/KeyMetricsGrid";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";

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
      {/* En-tête exécutif — Standard HEC/Polytechnique */}
      <ExecutiveHeader
        title="Cockpit Dirigeant"
        subtitle="Centre de commandement opérationnel"
        context="Agrégation en temps réel des KPIs des 5 plateformes. Décisions éclairées par données sourcées et recommandations IA."
        source={{
          source: "realtime",
          lastUpdated: new Date(),
          confidence: "high",
          methodology: "Consolidation multi-sources : Stripe, GitHub, Monitoring interne",
        }}
        actions={<EssentialModeToggle />}
      />

      {/* Key Metrics Grid */}
      <KeyMetricsGrid />

      {/* Control Row */}
      <div className="grid lg:grid-cols-4 gap-6">
        <AutopilotControl />
        <SchedulerPanel />
        <AICostWidget />
        <PanicSwitch />
      </div>

      {/* Executive Cockpit */}
      <ExecutiveCockpit />

      {/* AI Transparency */}
      <AITransparencyPanel />
    </div>
  );
}
