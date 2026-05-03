import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  { id: "real_problem", label: "Le problème est-il réel et documenté ?" },
  { id: "clear_need", label: "Le marché ou l'institution a-t-il un besoin clair ?" },
  { id: "team_can_execute", label: "L'équipe partenaire peut-elle exécuter ?" },
  { id: "value_potential", label: "Le projet peut-il générer de la valeur mesurable ?" },
  { id: "structuring_input", label: "Mon apport stratégique est-il vraiment structurant ?" },
  { id: "trustworthy_people", label: "Les personnes en face sont-elles fiables ?" },
  { id: "clean_legal", label: "Le cadre juridique pressenti est-il propre ?" },
];

export function GoNoGoChecklist() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const score = useMemo(() => Object.values(checks).filter(Boolean).length, [checks]);
  const isGo = score === QUESTIONS.length;
  const hasBlocker = Object.keys(checks).length === QUESTIONS.length && !isGo;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Grille de sélection Go / No-Go
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Règle 80/20 : 80% sélection, 20% création. Une seule réponse "non" suffit à refuser le deal en equity.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {QUESTIONS.map((q) => (
          <label
            key={q.id}
            className="flex items-start gap-3 rounded-md border border-border/40 bg-background/50 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <Checkbox
              checked={!!checks[q.id]}
              onCheckedChange={(v) => setChecks((s) => ({ ...s, [q.id]: !!v }))}
              className="mt-0.5"
            />
            <span className="text-sm leading-snug">{q.label}</span>
          </label>
        ))}

        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-lg border p-3 mt-2",
            isGo
              ? "border-success/40 bg-success/10"
              : hasBlocker
              ? "border-destructive/40 bg-destructive/10"
              : "border-border/60 bg-muted/30"
          )}
        >
          <div className="flex items-center gap-2 text-sm">
            {isGo ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="font-semibold">Go — projet éligible à un deal en equity.</span>
              </>
            ) : hasBlocker ? (
              <>
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-semibold">No-Go — un critère bloquant a été identifié.</span>
              </>
            ) : (
              <span className="text-muted-foreground">Validez chaque critère avant d'engager un deal.</span>
            )}
          </div>
          <Badge variant="outline" className="tabular-nums">
            {score} / {QUESTIONS.length}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
