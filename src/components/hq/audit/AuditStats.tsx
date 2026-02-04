import { Card, CardContent } from "@/components/ui/card";
import { FileText, User, Bot, Server } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditStatsProps {
  totalEntries: number;
  ownerActions: number;
  agentActions: number;
  systemActions: number;
  isLoading?: boolean;
}

export function AuditStats({ 
  totalEntries, 
  ownerActions, 
  agentActions, 
  systemActions,
  isLoading = false
}: AuditStatsProps) {
  const stats = [
    { 
      icon: FileText, 
      value: totalEntries, 
      label: "Total Entrées", 
      color: "text-foreground"
    },
    { 
      icon: User, 
      value: ownerActions, 
      label: "Actions Owner", 
      color: "text-primary"
    },
    { 
      icon: Bot, 
      value: agentActions, 
      label: "Actions Agents", 
      color: "text-success"
    },
    { 
      icon: Server, 
      value: systemActions, 
      label: "Actions Système", 
      color: "text-muted-foreground"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="card-executive">
          <CardContent className="p-6 text-center">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </>
            ) : (
              <>
                <div className={`text-3xl font-bold mb-1 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
