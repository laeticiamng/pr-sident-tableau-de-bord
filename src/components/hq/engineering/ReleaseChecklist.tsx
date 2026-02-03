import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, CheckCircle, Clock, AlertTriangle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  category: "code" | "security" | "quality" | "ops";
  autoCheck?: boolean;
  isChecked?: boolean;
}

const RELEASE_CHECKLIST: ChecklistItem[] = [
  { id: "tests", label: "Tests unitaires passés", description: "Tous les tests doivent être verts", category: "code", autoCheck: true },
  { id: "review", label: "Code review approuvé", description: "Au moins 1 approbation requise", category: "code" },
  { id: "docs", label: "Documentation à jour", description: "README et CHANGELOG mis à jour", category: "quality" },
  { id: "security", label: "Audit sécurité OK", description: "Aucune vulnérabilité critique", category: "security", autoCheck: true },
  { id: "performance", label: "Performance validée", description: "Temps de chargement < 3s", category: "quality" },
  { id: "rollback", label: "Rollback plan prêt", description: "Procédure de retour arrière documentée", category: "ops" },
  { id: "staging", label: "Testé en staging", description: "Validation sur environnement de pré-production", category: "ops" },
  { id: "changelog", label: "Notes de version", description: "Changements documentés pour les utilisateurs", category: "quality" },
];

const categoryColors = {
  code: "bg-blue-500/10 text-blue-600",
  security: "bg-red-500/10 text-red-600",
  quality: "bg-green-500/10 text-green-600",
  ops: "bg-purple-500/10 text-purple-600",
};

const categoryLabels = {
  code: "Code",
  security: "Sécurité",
  quality: "Qualité",
  ops: "Ops",
};

interface ReleaseChecklistProps {
  platformKey?: string;
  onDeploy?: () => void;
}

export function ReleaseChecklist({ platformKey, onDeploy }: ReleaseChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(RELEASE_CHECKLIST.filter(i => i.autoCheck).map(i => i.id))
  );

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const allChecked = RELEASE_CHECKLIST.every(item => checkedItems.has(item.id));
  const progress = (checkedItems.size / RELEASE_CHECKLIST.length) * 100;

  return (
    <Card className="card-executive">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Checklist de Release
          </CardTitle>
          <CardDescription>
            Critères de validation avant déploiement
            {platformKey && <span className="ml-1">({platformKey})</span>}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={allChecked ? "success" : "subtle"}>
            {checkedItems.size}/{RELEASE_CHECKLIST.length}
          </Badge>
          {allChecked && (
            <Button size="sm" variant="executive" onClick={onDeploy}>
              <Rocket className="h-4 w-4 mr-2" />
              Déployer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                allChecked ? "bg-success" : progress >= 75 ? "bg-warning" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {RELEASE_CHECKLIST.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <div 
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                  isChecked ? "border-success/30 bg-success/5" : "hover:bg-muted/30"
                )}
                onClick={() => toggleItem(item.id)}
              >
                <Checkbox 
                  id={item.id}
                  checked={isChecked}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <label 
                      htmlFor={item.id}
                      className={cn(
                        "text-sm font-medium cursor-pointer",
                        isChecked && "line-through text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </label>
                    <Badge 
                      variant="outline" 
                      className={cn("text-[10px]", categoryColors[item.category])}
                    >
                      {categoryLabels[item.category]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                {isChecked ? (
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {!allChecked && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm">
              Complétez tous les critères avant de déployer ({RELEASE_CHECKLIST.length - checkedItems.size} restant(s))
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
