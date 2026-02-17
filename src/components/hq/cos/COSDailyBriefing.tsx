import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sun,
  Moon,
  Target,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import { type COSDailyEntry } from "@/lib/cos-types";
import { cn } from "@/lib/utils";

interface COSDailyBriefingProps {
  todayMorning?: COSDailyEntry;
  todayEvening?: COSDailyEntry;
  onSave: (entry: COSDailyEntry) => void;
}

export function COSDailyBriefing({ todayMorning, todayEvening, onSave }: COSDailyBriefingProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const isMorningTime = hour < 14;

  const [morningDraft, setMorningDraft] = useState<COSDailyEntry>(
    todayMorning || {
      date: todayStr,
      type: "morning",
      focusDuJour: "",
      actions: ["", "", ""],
      risquePrincipal: "",
      decisionBloquante: "",
    }
  );

  const [eveningDraft, setEveningDraft] = useState<COSDailyEntry>(
    todayEvening || {
      date: todayStr,
      type: "evening",
      livre: undefined,
      causeRacine: "",
      correctifDemain: "",
    }
  );

  const handleSaveMorning = () => {
    const clean: COSDailyEntry = {
      ...morningDraft,
      actions: morningDraft.actions?.filter((a) => a && a.trim() !== "") as [string, string?, string?],
    };
    onSave(clean);
  };

  const handleSaveEvening = () => {
    onSave(eveningDraft);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Morning Briefing */}
      <Card className={cn("card-executive", isMorningTime && "ring-2 ring-amber-400/30")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            Briefing Matin
          </CardTitle>
          <CardDescription>
            {todayMorning ? (
              <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Rempli
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500 text-amber-500">
                A remplir
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
              <Target className="h-3.5 w-3.5 text-primary" />
              Focus du jour (1 seul livrable)
            </label>
            <Input
              value={morningDraft.focusDuJour || ""}
              onChange={(e) =>
                setMorningDraft({ ...morningDraft, focusDuJour: e.target.value })
              }
              placeholder="Ex: Landing page EmotionsCare publiee avec CTA"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">3 actions max</label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  value={morningDraft.actions?.[i] || ""}
                  onChange={(e) => {
                    const actions = [...(morningDraft.actions || ["", "", ""])] as [string, string?, string?];
                    actions[i] = e.target.value;
                    setMorningDraft({ ...morningDraft, actions });
                  }}
                  placeholder={`Action ${i + 1}`}
                  className="text-sm"
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Risque principal
            </label>
            <Input
              value={morningDraft.risquePrincipal || ""}
              onChange={(e) =>
                setMorningDraft({ ...morningDraft, risquePrincipal: e.target.value })
              }
              placeholder="Ex: Dispersion sur NEARVITY"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
              Decision bloquante
            </label>
            <Input
              value={morningDraft.decisionBloquante || ""}
              onChange={(e) =>
                setMorningDraft({ ...morningDraft, decisionBloquante: e.target.value })
              }
              placeholder="Ex: Choisir le pricing tier"
              className="text-sm"
            />
          </div>
          <Button onClick={handleSaveMorning} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder le matin
          </Button>
        </CardContent>
      </Card>

      {/* Evening Debrief */}
      <Card className={cn("card-executive", !isMorningTime && "ring-2 ring-indigo-400/30")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-500" />
            Debrief Soir
          </CardTitle>
          <CardDescription>
            {todayEvening ? (
              <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Rempli
              </Badge>
            ) : (
              <Badge variant="outline" className="border-indigo-500 text-indigo-500">
                A remplir
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Livre / Pas livre ?</label>
            <div className="flex gap-3">
              <Button
                variant={eveningDraft.livre === true ? "default" : "outline"}
                onClick={() => setEveningDraft({ ...eveningDraft, livre: true })}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                Livre
              </Button>
              <Button
                variant={eveningDraft.livre === false ? "destructive" : "outline"}
                onClick={() => setEveningDraft({ ...eveningDraft, livre: false })}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Pas livre
              </Button>
            </div>
          </div>
          {eveningDraft.livre === false && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Cause racine</label>
                <Textarea
                  value={eveningDraft.causeRacine || ""}
                  onChange={(e) =>
                    setEveningDraft({ ...eveningDraft, causeRacine: e.target.value })
                  }
                  placeholder="scope trop large / manque de clarte / distraction / sommeil / anxiete / trop de taches"
                  className="text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Correctif demain</label>
                <Textarea
                  value={eveningDraft.correctifDemain || ""}
                  onChange={(e) =>
                    setEveningDraft({ ...eveningDraft, correctifDemain: e.target.value })
                  }
                  placeholder="couper scope / reduire WIP / deplacer projet en incubation"
                  className="text-sm"
                  rows={2}
                />
              </div>
            </>
          )}
          <Button onClick={handleSaveEvening} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder le soir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
