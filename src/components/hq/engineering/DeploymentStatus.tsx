import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle, Clock, XCircle, ExternalLink, GitBranch } from "lucide-react";
import { usePlatforms } from "@/hooks/useHQData";
import { Skeleton } from "@/components/ui/skeleton";

interface Deployment {
  id: string;
  platform: string;
  version: string;
  status: "success" | "pending" | "failed";
  environment: "production" | "staging" | "preview";
  timestamp: string;
  commit: string;
}

const mockDeployments: Deployment[] = [
  {
    id: "dep-1",
    platform: "emotionscare",
    version: "3.2.1",
    status: "success",
    environment: "production",
    timestamp: "Il y a 2h",
    commit: "a3b2c1d"
  },
  {
    id: "dep-2",
    platform: "growth-copilot",
    version: "2.8.0",
    status: "pending",
    environment: "staging",
    timestamp: "Il y a 15min",
    commit: "f4e5d6c"
  },
  {
    id: "dep-3",
    platform: "system-compass",
    version: "1.5.3",
    status: "success",
    environment: "production",
    timestamp: "Il y a 1j",
    commit: "b7a8c9d"
  },
];

const statusConfig = {
  success: { icon: CheckCircle, color: "text-success", badge: "success" as const, label: "Réussi" },
  pending: { icon: Clock, color: "text-warning", badge: "warning" as const, label: "En cours" },
  failed: { icon: XCircle, color: "text-destructive", badge: "destructive" as const, label: "Échec" },
};

const envColors = {
  production: "gold",
  staging: "default",
  preview: "subtle",
} as const;

export function DeploymentStatus() {
  const { data: platforms, isLoading } = usePlatforms();

  const getPlatformName = (key: string) => {
    return platforms?.find(p => p.key === key)?.name || key;
  };

  if (isLoading) {
    return (
      <Card className="card-executive">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Rocket className="h-5 w-5 text-primary" />
          Déploiements Récents
        </CardTitle>
        <CardDescription>
          Statut des derniers déploiements par plateforme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockDeployments.map((deployment) => {
            const config = statusConfig[deployment.status];
            const StatusIcon = config.icon;
            
            return (
              <div 
                key={deployment.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <StatusIcon className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{getPlatformName(deployment.platform)}</h4>
                      <Badge variant={envColors[deployment.environment]}>
                        {deployment.environment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        v{deployment.version}
                      </span>
                      <span className="font-mono">{deployment.commit}</span>
                      <span>{deployment.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.badge}>
                    {config.label}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
