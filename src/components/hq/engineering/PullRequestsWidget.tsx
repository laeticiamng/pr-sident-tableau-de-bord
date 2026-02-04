import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitPullRequest, Clock, CheckCircle, XCircle, MessageSquare, ExternalLink, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullRequest {
  id: string;
  title: string;
  number: number;
  repo: string;
  author: string;
  status: "open" | "merged" | "closed";
  reviewStatus: "pending" | "approved" | "changes_requested";
  createdAt: string;
  comments: number;
  additions: number;
  deletions: number;
}

const PULL_REQUESTS: PullRequest[] = [
  {
    id: "1",
    title: "feat: Add AI emotion detection",
    number: 142,
    repo: "emotionscare",
    author: "laeticiamng",
    status: "open",
    reviewStatus: "pending",
    createdAt: "2026-02-03T14:00:00Z",
    comments: 2,
    additions: 345,
    deletions: 12,
  },
  {
    id: "2",
    title: "fix: Performance optimization dashboard",
    number: 89,
    repo: "growth-copilot",
    author: "ai-agent-cto",
    status: "open",
    reviewStatus: "approved",
    createdAt: "2026-02-02T10:00:00Z",
    comments: 5,
    additions: 128,
    deletions: 89,
  },
  {
    id: "3",
    title: "chore: Update dependencies",
    number: 56,
    repo: "system-compass",
    author: "ai-agent-engineering",
    status: "open",
    reviewStatus: "changes_requested",
    createdAt: "2026-02-01T16:00:00Z",
    comments: 8,
    additions: 234,
    deletions: 198,
  },
  {
    id: "4",
    title: "docs: API documentation update",
    number: 23,
    repo: "med-mng",
    author: "ai-agent-product",
    status: "merged",
    reviewStatus: "approved",
    createdAt: "2026-01-31T09:00:00Z",
    comments: 1,
    additions: 89,
    deletions: 23,
  },
];

const reviewStatusConfig = {
  pending: { label: "En attente", color: "text-amber-600 bg-amber-500/10", icon: Clock },
  approved: { label: "Approuvé", color: "text-success bg-success/10", icon: CheckCircle },
  changes_requested: { label: "Changements requis", color: "text-destructive bg-destructive/10", icon: XCircle },
};

export function PullRequestsWidget() {
  const openPRs = PULL_REQUESTS.filter(pr => pr.status === "open");
  const pendingReview = openPRs.filter(pr => pr.reviewStatus === "pending");
  const needsChanges = openPRs.filter(pr => pr.reviewStatus === "changes_requested");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffHours < 48) return "Hier";
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <GitPullRequest className="h-5 w-5 text-primary" />
              Pull Requests
            </CardTitle>
            <CardDescription>
              PRs en attente de review ou d'action
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="warning">{pendingReview.length} en attente</Badge>
            {needsChanges.length > 0 && (
              <Badge variant="destructive">{needsChanges.length} changements requis</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {PULL_REQUESTS.filter(pr => pr.status !== "closed").map((pr) => {
            const StatusIcon = reviewStatusConfig[pr.reviewStatus].icon;
            
            return (
              <div 
                key={pr.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors hover:bg-muted/30",
                  pr.reviewStatus === "changes_requested" && "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <GitPullRequest className={cn(
                        "h-4 w-4",
                        pr.status === "merged" ? "text-purple-500" : "text-success"
                      )} />
                      <span className="font-medium text-sm truncate">{pr.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="subtle" className="text-xs">#{pr.number}</Badge>
                      <span>{pr.repo}</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {pr.author}
                      </span>
                      <span>{formatDate(pr.createdAt)}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs ml-2", reviewStatusConfig[pr.reviewStatus].color)}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {reviewStatusConfig[pr.reviewStatus].label}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-success">+{pr.additions}</span>
                    <span className="text-destructive">-{pr.deletions}</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {pr.comments}
                    </span>
                  </div>
                  {pr.status === "open" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Voir sur GitHub
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-success">{openPRs.length}</p>
            <p className="text-xs text-muted-foreground">Ouvertes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-warning">{pendingReview.length}</p>
            <p className="text-xs text-muted-foreground">En revue</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-500">
              {PULL_REQUESTS.filter(pr => pr.status === "merged").length}
            </p>
            <p className="text-xs text-muted-foreground">Mergées</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">
              +{PULL_REQUESTS.reduce((sum, pr) => sum + pr.additions - pr.deletions, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Lignes nettes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
