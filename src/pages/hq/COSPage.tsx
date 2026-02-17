import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crosshair,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCOSData } from "@/hooks/useCOSData";
import { COSFocusDuJour } from "@/components/hq/cos/COSFocusDuJour";
import { COSPortfolio } from "@/components/hq/cos/COSPortfolio";
import { COSDailyBriefing } from "@/components/hq/cos/COSDailyBriefing";
import { COSMoneyDashboard } from "@/components/hq/cos/COSMoneyDashboard";
import { COSDeadlineEscalator } from "@/components/hq/cos/COSDeadlineEscalator";
import { COSAntiBurnout } from "@/components/hq/cos/COSAntiBurnout";
import { COS_RULES } from "@/lib/cos-types";

export default function COSPage() {
  const {
    state,
    activeProjects,
    cashFirstProject,
    canActivateProject,
    hasCashFirst,
    todayMorning,
    todayEvening,
    aggregatedMoney,
    initializeWithPlatforms,
    updateProjectStatus,
    toggleCashFirst,
    updateProject,
    updateDeadlineStatus,
    addDailyEntry,
    updateBurnout,
    updateMoneyMetrics,
  } = useCOSData();

  // Auto-initialize on first visit
  useEffect(() => {
    if (!state.initialized) {
      initializeWithPlatforms();
    }
  }, [state.initialized, initializeWithPlatforms]);

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12
    ? "Bonjour"
    : currentTime.getHours() < 18
    ? "Bon apres-midi"
    : "Bonsoir";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(38_92%_50%/0.1),transparent)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <Crosshair className="h-3 w-3 mr-1" />
              Chief Operating System
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {greeting}, Madame la Presidente
            </h1>
            <p className="text-white/60 text-lg">
              {activeProjects.length}/{COS_RULES.MAX_ACTIVE_PROJECTS} projets actifs
              {cashFirstProject && (
                <span className="text-emerald-400 ml-2">
                  — Cash-first : {cashFirstProject.name}
                </span>
              )}
              {!hasCashFirst && activeProjects.length > 0 && (
                <span className="text-destructive ml-2 font-medium">
                  — Aucun cash-first !
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
              Release train : toutes les {COS_RULES.RELEASE_CADENCE_DAYS}j
            </Badge>
          </div>
        </div>

        {/* COS Rules Summary */}
        <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "WIP max", value: `${COS_RULES.MAX_ACTIVE_PROJECTS} projets` },
            { label: "Cash-first", value: hasCashFirst ? "OK" : "Manquant" },
            { label: "Cut-off", value: state.burnout.heureFinTravail },
            { label: "Sommeil", value: `${state.burnout.sommeilHeures}h / ${state.burnout.sommeilObjectif}h` },
          ].map((rule) => (
            <div key={rule.label} className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
              <div className="text-xs text-white/50">{rule.label}</div>
              <div className="text-sm font-bold mt-0.5">{rule.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus du Jour (always visible at top) */}
      <COSFocusDuJour
        morningEntry={todayMorning}
        activeProjects={activeProjects}
        drapeauRouge={state.burnout.drapeauRouge}
      />

      {/* Anti-Burnout alert if red flag */}
      {state.burnout.drapeauRouge && (
        <COSAntiBurnout metrics={state.burnout} onUpdate={updateBurnout} />
      )}

      {/* Money Dashboard */}
      <COSMoneyDashboard
        aggregated={aggregatedMoney}
        activeProjects={activeProjects}
        onUpdateMetrics={updateMoneyMetrics}
      />

      {/* Portfolio + Deadlines */}
      <div className="grid gap-6 lg:grid-cols-2">
        <COSPortfolio
          projects={state.projects}
          activeCount={activeProjects.length}
          canActivate={canActivateProject}
          hasCashFirst={hasCashFirst}
          onStatusChange={updateProjectStatus}
          onToggleCashFirst={toggleCashFirst}
          onUpdateProject={updateProject}
        />
        <COSDeadlineEscalator
          projects={state.projects}
          onUpdateDeadline={updateDeadlineStatus}
        />
      </div>

      {/* Daily Briefing */}
      <COSDailyBriefing
        todayMorning={todayMorning}
        todayEvening={todayEvening}
        onSave={addDailyEntry}
      />

      {/* Anti-Burnout (always visible if not already shown) */}
      {!state.burnout.drapeauRouge && (
        <COSAntiBurnout metrics={state.burnout} onUpdate={updateBurnout} />
      )}

      {/* Last Updated */}
      <div className="text-center text-xs text-muted-foreground">
        Derniere mise a jour COS : {new Date(state.lastUpdated).toLocaleString("fr-FR")}
      </div>
    </div>
  );
}
