import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, FileCheck, Shield } from "lucide-react";
import { useState } from "react";

const AIPD_ITEMS = [
  { id: "1", label: "Description du traitement et de ses finalités", done: true },
  { id: "2", label: "Évaluation de la nécessité et proportionnalité", done: true },
  { id: "3", label: "Identification des risques pour les personnes", done: true },
  { id: "4", label: "Mesures de sécurité techniques envisagées", done: true },
  { id: "5", label: "Mesures de sécurité organisationnelles", done: false },
  { id: "6", label: "Consultation des parties prenantes", done: false },
  { id: "7", label: "Validation par le DPO", done: false },
  { id: "8", label: "Documentation finale et archivage", done: false },
];

export function AIPDChecklist() {
  const [items, setItems] = useState(AIPD_ITEMS);
  const completedCount = items.filter(i => i.done).length;
  const progress = (completedCount / items.length) * 100;

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <FileCheck className="h-5 w-5 text-primary" />
              Analyse d'Impact (AIPD)
            </CardTitle>
            <CardDescription>
              Checklist de conformité RGPD pour les traitements à risque
            </CardDescription>
          </div>
          <Badge variant={progress === 100 ? "success" : progress >= 50 ? "warning" : "destructive"}>
            {completedCount}/{items.length} complétés
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {progress.toFixed(0)}% complété
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <Checkbox 
                checked={item.done} 
                onCheckedChange={() => toggleItem(item.id)}
              />
              <span className={item.done ? "line-through text-muted-foreground" : ""}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {progress < 100 && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">
              L'AIPD doit être complétée avant tout traitement à risque
            </span>
          </div>
        )}

        {progress === 100 && (
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/30 flex items-center gap-2">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-sm text-success">
              AIPD complète - Traitement conforme
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
