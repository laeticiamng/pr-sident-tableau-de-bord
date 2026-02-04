import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Shield,
  Rocket,
  Users,
  Clock
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "run" | "approval" | "alert" | "release" | "security";
  title: string;
  description: string;
  timestamp: Date;
  status: "success" | "warning" | "error" | "info";
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "run",
    title: "Brief Exécutif terminé",
    description: "Analyse quotidienne des 5 plateformes",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: "success",
  },
  {
    id: "2",
    type: "approval",
    title: "Action approuvée",
    description: "Mise à jour du pipeline marketing",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: "info",
  },
  {
    id: "3",
    type: "security",
    title: "Audit sécurité complété",
    description: "RLS vérifié sur toutes les tables",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    status: "success",
  },
  {
    id: "4",
    type: "alert",
    title: "Latence détectée",
    description: "Growth Copilot - API response > 2s",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    status: "warning",
  },
  {
    id: "5",
    type: "release",
    title: "Release déployée",
    description: "EmotionsCare v2.4.1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: "success",
  },
];

const getIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "run": return FileText;
    case "approval": return CheckCircle;
    case "alert": return AlertTriangle;
    case "release": return Rocket;
    case "security": return Shield;
    default: return Activity;
  }
};

const getStatusColor = (status: ActivityItem["status"]) => {
  switch (status) {
    case "success": return "text-success";
    case "warning": return "text-warning";
    case "error": return "text-destructive";
    default: return "text-primary";
  }
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  return `Il y a ${Math.floor(seconds / 86400)}j`;
}

interface RecentActivityFeedProps {
  className?: string;
  maxItems?: number;
}

export function RecentActivityFeed({ className, maxItems = 5 }: RecentActivityFeedProps) {
  const activities = mockActivities.slice(0, maxItems);

  return (
    <Card className={`card-executive ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
