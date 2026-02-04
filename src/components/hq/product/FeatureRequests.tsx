import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ThumbsUp, MessageSquare, ArrowUpRight } from "lucide-react";

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  platform: string;
  votes: number;
  comments: number;
  status: "new" | "under_review" | "planned" | "in_progress" | "shipped";
  requestedBy: string;
}

const mockRequests: FeatureRequest[] = [
  {
    id: "fr-1",
    title: "Export PDF des rapports",
    description: "Pouvoir exporter les rapports analytiques en PDF",
    platform: "growth-copilot",
    votes: 47,
    comments: 12,
    status: "planned",
    requestedBy: "Utilisateurs Pro"
  },
  {
    id: "fr-2",
    title: "Mode hors-ligne",
    description: "Accès aux données sans connexion internet",
    platform: "emotionscare",
    votes: 89,
    comments: 23,
    status: "under_review",
    requestedBy: "Entreprises"
  },
  {
    id: "fr-3",
    title: "Intégration Slack",
    description: "Notifications et actions depuis Slack",
    platform: "system-compass",
    votes: 34,
    comments: 8,
    status: "in_progress",
    requestedBy: "Teams"
  },
];

const statusColors = {
  new: "subtle",
  under_review: "warning",
  planned: "default",
  in_progress: "gold",
  shipped: "success",
} as const;

const statusLabels = {
  new: "Nouveau",
  under_review: "En revue",
  planned: "Planifié",
  in_progress: "En cours",
  shipped: "Livré",
};

export function FeatureRequests() {
  const totalVotes = mockRequests.reduce((sum, r) => sum + r.votes, 0);

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-primary" />
          Demandes de Fonctionnalités
        </CardTitle>
        <CardDescription>
          {mockRequests.length} demandes actives • {totalVotes} votes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockRequests.map((request) => (
            <div 
              key={request.id}
              className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{request.title}</h4>
                    <Badge variant={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {request.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="subtle">{request.platform}</Badge>
                    <span className="text-muted-foreground">
                      Demandé par {request.requestedBy}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-primary" />
                      {request.votes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {request.comments}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button variant="outline" className="w-full mt-4">
          Voir toutes les demandes
        </Button>
      </CardContent>
    </Card>
  );
}
