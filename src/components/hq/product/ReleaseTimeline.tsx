import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMELINE_DATA = [
  { 
    date: "2026-02-10", 
    platform: "EmotionsCare", 
    version: "2.4.0", 
    status: "planned",
    features: 5
  },
  { 
    date: "2026-02-05", 
    platform: "Growth Copilot", 
    version: "1.8.0", 
    status: "released",
    features: 8
  },
  { 
    date: "2026-02-03", 
    platform: "System Compass", 
    version: "3.2.1", 
    status: "released",
    features: 3
  },
  { 
    date: "2026-01-28", 
    platform: "Med MNG", 
    version: "1.1.0", 
    status: "released",
    features: 4
  },
  { 
    date: "2026-01-20", 
    platform: "Pixel Perfect Replica", 
    version: "0.9.0", 
    status: "released",
    features: 6
  },
];

export function ReleaseTimeline() {
  const today = new Date();

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          Timeline des Releases
        </CardTitle>
        <CardDescription>
          Historique et prochaines versions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted" />
          
          <div className="space-y-6">
            {TIMELINE_DATA.map((release, index) => {
              const releaseDate = new Date(release.date);
              const isPast = releaseDate < today;
              const isToday = releaseDate.toDateString() === today.toDateString();
              
              return (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute -left-4 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center",
                    release.status === "released" 
                      ? "border-success" 
                      : release.status === "planned" 
                        ? "border-primary" 
                        : "border-muted-foreground"
                  )}>
                    {release.status === "released" ? (
                      <CheckCircle className="h-2.5 w-2.5 text-success" />
                    ) : (
                      <Clock className="h-2.5 w-2.5 text-primary" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={cn(
                    "ml-4 p-4 rounded-lg border transition-all hover:shadow-md",
                    release.status === "planned" ? "border-primary/30 bg-primary/5" : ""
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Rocket className={cn(
                          "h-4 w-4",
                          release.status === "released" ? "text-success" : "text-primary"
                        )} />
                        <span className="font-semibold text-sm">{release.platform}</span>
                        <Badge variant="subtle" className="font-mono text-xs">
                          v{release.version}
                        </Badge>
                      </div>
                      <Badge variant={release.status === "released" ? "success" : "gold"}>
                        {release.status === "released" ? "Publié" : "Planifié"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(release.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                      <span>{release.features} fonctionnalités</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
