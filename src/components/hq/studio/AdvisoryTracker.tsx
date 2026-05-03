import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudioAdvisory } from "@/hooks/useStudio";
import {
  ADVISORY_STATUS_LABEL,
  type StudioAdvisoryStatus,
} from "@/lib/studio-types";
import { CalendarClock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<StudioAdvisoryStatus, string> = {
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  ended: "bg-muted text-muted-foreground",
};

export function AdvisoryTracker() {
  const { data, isLoading } = useStudioAdvisory();

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Missions advisory en cours
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucune mission advisory active. Une mission advisory est créée lorsqu'un deal est signé et qu'EmotionSphere conserve un rôle stratégique.
          </p>
        ) : (
          <div className="space-y-2">
            {(data ?? []).map((mission) => (
              <div
                key={mission.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{mission.project_name}</p>
                    {mission.role && (
                      <Badge variant="outline" className="text-[10px]">{mission.role}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    {mission.meeting_frequency && <span>Cadence : {mission.meeting_frequency}</span>}
                    {mission.monthly_commitment && <span>Engagement : {mission.monthly_commitment}</span>}
                    {mission.next_review_date && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        Prochaine revue : {new Date(mission.next_review_date).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[mission.status])}>
                  {ADVISORY_STATUS_LABEL[mission.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
