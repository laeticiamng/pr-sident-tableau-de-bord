import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitCommit, Database, TestTube2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { MANAGED_PLATFORMS } from "@/lib/constants";

// Preview images map
import emotionscarePreview from "@/assets/previews/emotionscare-preview.png";
import nearvityPreview from "@/assets/previews/nearvity-preview.png";
import systemCompassPreview from "@/assets/previews/system-compass-preview.png";
import growthCopilotPreview from "@/assets/previews/growth-copilot-preview.png";
import medMngPreview from "@/assets/previews/med-mng-preview.png";
import urgenceosPreview from "@/assets/previews/urgenceos-preview.png";
import trackTriumphPreview from "@/assets/previews/track-triumph-preview.png";
import governancePreview from "@/assets/previews/governance-ia-preview.png";
import studybeatsPreview from "@/assets/previews/studybeats-preview.png";
import vascularAtlasPreview from "@/assets/previews/vascular-atlas-preview.png";

const previewImages: Record<string, string> = {
  "emotionscare": emotionscarePreview,
  "nearvity": nearvityPreview,
  "system-compass": systemCompassPreview,
  "growth-copilot": growthCopilotPreview,
  "med-mng": medMngPreview,
  "swift-care-hub": urgenceosPreview,
  "track-triumph-tavern": trackTriumphPreview,
  "trust-seal-chain": governancePreview,
  "studybeats": studybeatsPreview,
  "vascular-atlas": vascularAtlasPreview,
};

const statusConfig = {
  green: { label: "Opérationnel", variant: "success" as const, dot: "bg-success" },
  amber: { label: "Attention", variant: "warning" as const, dot: "bg-warning" },
  red: { label: "Critique", variant: "destructive" as const, dot: "bg-destructive" },
};

interface PlatformPreviewCardProps {
  platform: {
    key: string;
    name: string;
    description?: string;
    status: string;
    uptime_percent?: number;
    github_url?: string;
  };
  onSelect?: (key: string) => void;
}

export function PlatformPreviewCard({ platform, onSelect }: PlatformPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = statusConfig[platform.status as keyof typeof statusConfig] || statusConfig.green;
  const managed = MANAGED_PLATFORMS.find(p => p.key === platform.key);
  const previewSrc = previewImages[platform.key];

  return (
    <Card
      className="group overflow-hidden border-2 border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(platform.key)}
    >
      {/* Preview Image — 21st.dev style */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={`Aperçu de ${platform.name}`}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              isHovered && "scale-105"
            )}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Aperçu non disponible
          </div>
        )}

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Button size="sm" variant="secondary" className="gap-2" asChild>
            <a href={managed?.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Eye className="h-3.5 w-3.5" />
              Voir le site
            </a>
          </Button>
          {platform.github_url && (
            <Button size="sm" variant="outline" className="gap-2" asChild>
              <a href={platform.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="h-3.5 w-3.5" />
                GitHub
              </a>
            </Button>
          )}
        </div>

        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <Badge variant={config.variant} className="text-[10px] gap-1 shadow-md">
            <div className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
            {config.label}
          </Badge>
        </div>

        {/* Production/Prototype badge */}
        {managed && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="text-[10px] bg-background/70 backdrop-blur-sm border-border/50">
              {managed.status === "production" ? "Production" : "Prototype"}
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="p-4 space-y-3">
        {/* Title + uptime */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{platform.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {managed?.shortDescription || platform.description}
            </p>
          </div>
          {platform.uptime_percent != null && (
            <span className="text-xs font-mono font-medium tabular-nums text-muted-foreground shrink-0">
              {platform.uptime_percent.toFixed(1)}%
            </span>
          )}
        </div>

        {/* Quick stats row */}
        {managed && (
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <GitCommit className="h-3 w-3" />
              {managed.stats.commits > 1000
                ? `${(managed.stats.commits / 1000).toFixed(1)}K`
                : managed.stats.commits}
            </span>
            <span className="flex items-center gap-1">
              <TestTube2 className="h-3 w-3" />
              {managed.stats.tests}
            </span>
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {managed.stats.tables}
            </span>
          </div>
        )}

        {/* Features pills */}
        {managed && (
          <div className="flex flex-wrap gap-1">
            {managed.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
              >
                {f}
              </span>
            ))}
            {managed.features.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                +{managed.features.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
