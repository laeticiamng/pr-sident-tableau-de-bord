import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";

interface ApprovalStatsProps {
  pending: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  avgResponseTime?: string;
}

export function ApprovalStats({ 
  pending, 
  approvedThisMonth, 
  rejectedThisMonth,
  avgResponseTime = "< 2h"
}: ApprovalStatsProps) {
  const stats = [
    { 
      icon: Clock, 
      value: pending, 
      label: "En attente", 
      color: "text-warning" 
    },
    { 
      icon: CheckCircle, 
      value: approvedThisMonth, 
      label: "Approuvées ce mois", 
      color: "text-success" 
    },
    { 
      icon: XCircle, 
      value: rejectedThisMonth, 
      label: "Rejetées ce mois", 
      color: "text-destructive" 
    },
    { 
      icon: TrendingUp, 
      value: avgResponseTime, 
      label: "Temps de réponse moy.", 
      color: "text-primary" 
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="card-executive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
