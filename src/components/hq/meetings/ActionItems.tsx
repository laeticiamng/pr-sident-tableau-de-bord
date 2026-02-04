import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, User, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Mock action items from meetings
const ACTION_ITEMS = [
  {
    id: "1",
    title: "Finaliser roadmap Q2 2026",
    assignee: "DG Produit",
    dueDate: "2026-02-10",
    meeting: "Revue Exécutive",
    priority: "high",
    completed: false
  },
  {
    id: "2",
    title: "Préparer présentation investisseurs",
    assignee: "DG Finance",
    dueDate: "2026-02-15",
    meeting: "Standup DG",
    priority: "high",
    completed: false
  },
  {
    id: "3",
    title: "Audit sécurité plateforme Growth Copilot",
    assignee: "DG Engineering",
    dueDate: "2026-02-20",
    meeting: "Directeurs Plateforme",
    priority: "medium",
    completed: false
  },
  {
    id: "4",
    title: "Rapport mensuel marketing",
    assignee: "DG Marketing",
    dueDate: "2026-02-05",
    meeting: "Standup DG",
    priority: "low",
    completed: true
  },
  {
    id: "5",
    title: "Mise à jour documentation API",
    assignee: "DG Engineering",
    dueDate: "2026-02-12",
    meeting: "Revue Exécutive",
    priority: "medium",
    completed: false
  },
];

const priorityConfig = {
  high: { label: "Urgent", color: "text-destructive", bg: "bg-destructive/10" },
  medium: { label: "Normal", color: "text-warning", bg: "bg-warning/10" },
  low: { label: "Faible", color: "text-muted-foreground", bg: "bg-muted" },
};

interface ActionItemsProps {
  className?: string;
}

export function ActionItems({ className }: ActionItemsProps) {
  const [items, setItems] = useState(ACTION_ITEMS);
  
  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const pendingCount = items.filter(i => !i.completed).length;
  const overdueCount = items.filter(i => !i.completed && new Date(i.dueDate) < new Date()).length;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <CheckSquare className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Actions Issues des Réunions</CardTitle>
              <CardDescription>
                {pendingCount} action(s) en cours, {overdueCount} en retard
              </CardDescription>
            </div>
          </div>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {overdueCount} en retard
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const priority = priorityConfig[item.priority as keyof typeof priorityConfig];
          const isOverdue = !item.completed && new Date(item.dueDate) < new Date();
          
          return (
            <div 
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                item.completed && "opacity-60 bg-muted/30",
                isOverdue && "border-destructive/50 bg-destructive/5"
              )}
            >
              <Checkbox 
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  item.completed && "line-through text-muted-foreground"
                )}>
                  {item.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.assignee}
                  </span>
                  <span className={cn(
                    "flex items-center gap-1",
                    isOverdue && "text-destructive font-medium"
                  )}>
                    <Calendar className="h-3 w-3" />
                    {new Date(item.dueDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", priority.bg, priority.color)}
                >
                  {priority.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{item.meeting}</span>
              </div>
            </div>
          );
        })}
        
        <Button variant="outline" size="sm" className="w-full mt-2">
          Voir toutes les actions
        </Button>
      </CardContent>
    </Card>
  );
}
