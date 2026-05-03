import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import {
  RISK_LEVEL_LABEL,
  simulateEquityDeal,
  type DealSimulationInput,
  type StudioRiskLevel,
} from "@/lib/studio-types";
import { EquityRecommendationCard } from "./EquityRecommendationCard";

const INVOLVEMENT_LABELS: Record<DealSimulationInput["involvementLevel"], string> = {
  1: "Conseil ponctuel / idée rapide",
  2: "Diagnostic + angle stratégique",
  3: "Blueprint complet",
  4: "Blueprint + réponse appel à projet + suivi",
  5: "Concept fondateur + advisory long terme",
};

export function DealSimulator() {
  const [involvement, setInvolvement] = useState<DealSimulationInput["involvementLevel"]>(3);
  const [size, setSize] = useState<DealSimulationInput["projectSize"]>("medium");
  const [effort, setEffort] = useState<DealSimulationInput["effort"]>("moderate");
  const [duration, setDuration] = useState<DealSimulationInput["duration"]>("medium");
  const [risk, setRisk] = useState<StudioRiskLevel>("medium");
  const [probability, setProbability] = useState<DealSimulationInput["executionProbability"]>("medium");
  const [team, setTeam] = useState<DealSimulationInput["teamQuality"]>("strong");
  const [futureValue, setFutureValue] = useState<DealSimulationInput["futureValuePotential"]>("high");

  const simulation = useMemo(
    () =>
      simulateEquityDeal({
        involvementLevel: involvement,
        projectSize: size,
        effort,
        duration,
        riskLevel: risk,
        executionProbability: probability,
        teamQuality: team,
        futureValuePotential: futureValue,
      }),
    [involvement, size, effort, duration, risk, probability, team, futureValue],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4 text-primary" />
            Simulateur Equity Deal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Niveau d'implication EmotionSphere</Label>
            <Slider
              value={[involvement]}
              min={1}
              max={5}
              step={1}
              onValueChange={(v) => setInvolvement(v[0] as DealSimulationInput["involvementLevel"])}
            />
            <p className="text-xs text-muted-foreground">{INVOLVEMENT_LABELS[involvement]}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sim-size">Taille du projet</Label>
              <Select value={size} onValueChange={(v) => setSize(v as DealSimulationInput["projectSize"])}>
                <SelectTrigger id="sim-size"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Petit (&lt; 100 k€)</SelectItem>
                  <SelectItem value="medium">Moyen (100 k€ – 1 M€)</SelectItem>
                  <SelectItem value="large">Grand (1 M€ – 10 M€)</SelectItem>
                  <SelectItem value="flagship">Flagship (&gt; 10 M€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-effort">Effort estimé</Label>
              <Select value={effort} onValueChange={(v) => setEffort(v as DealSimulationInput["effort"])}>
                <SelectTrigger id="sim-effort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Léger (qq jours)</SelectItem>
                  <SelectItem value="moderate">Modéré (qq semaines)</SelectItem>
                  <SelectItem value="heavy">Lourd (plusieurs mois)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-duration">Durée d'implication</Label>
              <Select value={duration} onValueChange={(v) => setDuration(v as DealSimulationInput["duration"])}>
                <SelectTrigger id="sim-duration"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Courte (&lt; 6 mois)</SelectItem>
                  <SelectItem value="medium">Moyenne (6 – 18 mois)</SelectItem>
                  <SelectItem value="long">Longue (&gt; 18 mois)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-risk">Niveau de risque</Label>
              <Select value={risk} onValueChange={(v) => setRisk(v as StudioRiskLevel)}>
                <SelectTrigger id="sim-risk"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(RISK_LEVEL_LABEL) as [StudioRiskLevel, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-prob">Probabilité d'exécution</Label>
              <Select value={probability} onValueChange={(v) => setProbability(v as DealSimulationInput["executionProbability"])}>
                <SelectTrigger id="sim-prob"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-team">Qualité de l'équipe</Label>
              <Select value={team} onValueChange={(v) => setTeam(v as DealSimulationInput["teamQuality"])}>
                <SelectTrigger id="sim-team"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak">Fragile</SelectItem>
                  <SelectItem value="average">Correcte</SelectItem>
                  <SelectItem value="strong">Solide</SelectItem>
                  <SelectItem value="elite">Élite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="sim-value">Potentiel de valeur future</Label>
              <Select value={futureValue} onValueChange={(v) => setFutureValue(v as DealSimulationInput["futureValuePotential"])}>
                <SelectTrigger id="sim-value"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                  <SelectItem value="exceptional">Exceptionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <EquityRecommendationCard simulation={simulation} />
    </div>
  );
}
