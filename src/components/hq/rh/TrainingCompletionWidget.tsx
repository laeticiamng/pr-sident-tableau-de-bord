import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Video, CheckCircle, Clock, Award, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingModule {
  id: string;
  title: string;
  type: "video" | "doc" | "workshop";
  duration: string;
  completedBy: number;
  totalEmployees: number;
  mandatory: boolean;
  dueDate?: string;
}

const TRAINING_MODULES: TrainingModule[] = [
  { id: "1", title: "Sécurité des Données (RGPD)", type: "video", duration: "45 min", completedBy: 12, totalEmployees: 15, mandatory: true, dueDate: "2026-02-15" },
  { id: "2", title: "Introduction aux Agents IA", type: "workshop", duration: "2h", completedBy: 8, totalEmployees: 15, mandatory: true },
  { id: "3", title: "Utilisation du HQ", type: "doc", duration: "30 min", completedBy: 15, totalEmployees: 15, mandatory: false },
  { id: "4", title: "Processus d'Approbation", type: "video", duration: "20 min", completedBy: 10, totalEmployees: 15, mandatory: true },
  { id: "5", title: "Gestion des Incidents", type: "workshop", duration: "1h30", completedBy: 5, totalEmployees: 15, mandatory: false },
];

const typeIcons = {
  video: Video,
  doc: BookOpen,
  workshop: Users,
};

const typeLabels = {
  video: "Vidéo",
  doc: "Documentation",
  workshop: "Atelier",
};

interface TrainingCompletionWidgetProps {
  className?: string;
}

export function TrainingCompletionWidget({ className }: TrainingCompletionWidgetProps) {
  const mandatoryModules = TRAINING_MODULES.filter(m => m.mandatory);
  const avgMandatoryCompletion = mandatoryModules.length > 0
    ? mandatoryModules.reduce((sum, m) => sum + (m.completedBy / m.totalEmployees) * 100, 0) / mandatoryModules.length
    : 0;

  const totalCompletion = TRAINING_MODULES.reduce((sum, m) => sum + (m.completedBy / m.totalEmployees) * 100, 0) / TRAINING_MODULES.length;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Formations & Certifications
            </CardTitle>
            <CardDescription>
              Suivi des formations obligatoires et optionnelles
            </CardDescription>
          </div>
          <Badge variant={avgMandatoryCompletion >= 80 ? "success" : "warning"}>
            {avgMandatoryCompletion.toFixed(0)}% obligatoires
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Obligatoires</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {avgMandatoryCompletion.toFixed(0)}%
            </div>
            <Progress value={avgMandatoryCompletion} className="h-1.5 mt-2" />
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Toutes</span>
            </div>
            <div className="text-2xl font-bold">
              {totalCompletion.toFixed(0)}%
            </div>
            <Progress value={totalCompletion} className="h-1.5 mt-2" />
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-3">
          {TRAINING_MODULES.map((module) => {
            const Icon = typeIcons[module.type];
            const completionRate = (module.completedBy / module.totalEmployees) * 100;
            const isComplete = completionRate === 100;
            
            return (
              <div 
                key={module.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors hover:bg-muted/30",
                  isComplete && "border-success/30 bg-success/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "h-4 w-4",
                      isComplete ? "text-success" : "text-muted-foreground"
                    )} />
                    <span className="font-medium text-sm">{module.title}</span>
                    {module.mandatory && (
                      <Badge variant="destructive" className="text-[10px]">
                        Obligatoire
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {module.duration}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    {typeLabels[module.type]}
                  </span>
                  <span className={isComplete ? "text-success font-medium" : ""}>
                    {module.completedBy}/{module.totalEmployees} complété
                  </span>
                </div>
                
                <Progress 
                  value={completionRate} 
                  className="h-1.5"
                />
                
                {module.dueDate && !isComplete && (
                  <p className="text-xs text-warning mt-1">
                    Échéance : {new Date(module.dueDate).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
