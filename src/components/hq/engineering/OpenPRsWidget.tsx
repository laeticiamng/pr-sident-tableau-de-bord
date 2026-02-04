import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitPullRequest, Check, X, Clock, GitMerge, User, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock open PRs data
const OPEN_PRS = [
  {
    id: "1",
    title: "feat: Add real-time notifications system",
    platform: "emotionscare",
    author: "Agent Engineering",
    status: "review_required",
    additions: 342,
    deletions: 45,
    createdAt: "2026-02-03T10:30:00Z",
    reviewers: ["DG Engineering", "DG Sécurité"]
  },
  {
    id: "2",
    title: "fix: Resolve memory leak in dashboard",
    platform: "growth-copilot",
    author: "Agent Engineering",
    status: "approved",
    additions: 23,
    deletions: 156,
    createdAt: "2026-02-02T14:15:00Z",
    reviewers: ["DG Engineering"]
  },
  {
    id: "3",
    title: "chore: Update dependencies for security patch",
    platform: "system-compass",
    author: "Agent DevOps",
    status: "changes_requested",
    additions: 892,
    deletions: 892,
    createdAt: "2026-02-01T09:00:00Z",
    reviewers: ["DG Engineering", "DG Sécurité"]
  },
  {
    id: "4",
    title: "feat: New AI model integration",
    platform: "med-mng",
    author: "Agent ML",
    status: "review_required",
    additions: 1245,
    deletions: 89,
    createdAt: "2026-02-04T08:45:00Z",
    reviewers: ["DG Engineering", "DG Produit"]
  },
];

const statusConfig = {
  review_required: { label: "En attente", color: "text-warning", bg: "bg-warning/10", icon: Clock },
  approved: { label: "Approuvé", color: "text-success", bg: "bg-success/10", icon: Check },
  changes_requested: { label: "Modifications", color: "text-destructive", bg: "bg-destructive/10", icon: X },
  merged: { label: "Fusionné", color: "text-accent", bg: "bg-accent/10", icon: GitMerge },
};

interface OpenPRsWidgetProps {
  className?: string;
}

export function OpenPRsWidget({ className }: OpenPRsWidgetProps) {
  const reviewRequiredCount = OPEN_PRS.filter(pr => pr.status === "review_required").length;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <GitPullRequest className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Pull Requests Ouvertes</CardTitle>
              <CardDescription>
                {OPEN_PRS.length} PR(s) ouvertes, {reviewRequiredCount} en attente de revue
              </CardDescription>
            </div>
          </div>
          <Badge variant={reviewRequiredCount > 0 ? "warning" : "success"}>
            {reviewRequiredCount} à revoir
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {OPEN_PRS.map((pr) => {
          const status = statusConfig[pr.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          const timeAgo = getTimeAgo(pr.createdAt);
          
          return (
            <div 
              key={pr.id}
              className="p-3 rounded-lg border hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GitPullRequest className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <h4 className="font-medium text-sm truncate">{pr.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="subtle" className="text-xs">{pr.platform}</Badge>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {pr.author}
                    </span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", status.bg, status.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-success">+{pr.additions}</span>
                    <span className="text-destructive">-{pr.deletions}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Reviewers:</span>
                  {pr.reviewers.map((r, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {r}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Voir
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `il y a ${diffDays}j`;
  if (diffHours > 0) return `il y a ${diffHours}h`;
  return "à l'instant";
}
