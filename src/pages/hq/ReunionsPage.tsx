import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Video, 
  Users, 
  Clock, 
  FileText, 
  Play,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useRecentRuns, useExecuteRun } from "@/hooks/useHQData";
import { UpcomingMeetings } from "@/components/hq/meetings/UpcomingMeetings";
import { MeetingNotes } from "@/components/hq/meetings/MeetingNotes";
import { ParticipationIndicator } from "@/components/hq/meetings/ParticipationIndicator";
import { ActionItems } from "@/components/hq/meetings/ActionItems";

const meetingTypes = [
  { 
    id: "CEO_STANDUP_MEETING", 
    label: "Standup DG", 
    description: "Réunion quotidienne avec le Directeur Général",
    icon: Video,
    frequency: "Quotidien"
  },
  { 
    id: "PLATFORM_DIRECTORS_MEETING", 
    label: "Directeurs Plateforme", 
    description: "Réunion hebdomadaire avec les 5 DG de plateforme",
    icon: Users,
    frequency: "Hebdomadaire"
  },
  { 
    id: "WEEKLY_EXEC_REVIEW", 
    label: "Revue Exécutive", 
    description: "Revue stratégique avec tout le comité exécutif",
    icon: Calendar,
    frequency: "Hebdomadaire"
  },
];

export default function ReunionsPage() {
  const { data: recentRuns, isLoading } = useRecentRuns(20);
  const executeRun = useExecuteRun();
  const [runningMeeting, setRunningMeeting] = useState<string | null>(null);

  // Filter for meeting-type runs
  const meetingRuns = recentRuns?.filter(r => 
    r.run_type.includes("MEETING") || r.run_type.includes("REVIEW") || r.run_type.includes("STANDUP")
  );

  const handleStartMeeting = async (meetingType: string) => {
    setRunningMeeting(meetingType);
    try {
      await executeRun.mutateAsync({ run_type: meetingType });
    } finally {
      setRunningMeeting(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Réunions</h1>
        <p className="text-muted-foreground text-lg">
          Gérez et consultez les comptes-rendus des réunions exécutives.
        </p>
      </div>

      {/* Quick Start Meeting */}
      <div className="grid gap-4 md:grid-cols-3">
        {meetingTypes.map((meeting) => (
          <Card key={meeting.id} className="card-executive">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <meeting.icon className="h-5 w-5 text-primary" />
                {meeting.label}
              </CardTitle>
              <CardDescription>{meeting.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="subtle">{meeting.frequency}</Badge>
              </div>
              <Button 
                variant="executive" 
                className="w-full"
                onClick={() => handleStartMeeting(meeting.id)}
                disabled={runningMeeting === meeting.id}
              >
                {runningMeeting === meeting.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Démarrer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Meetings Agenda */}
      <UpcomingMeetings onStartMeeting={(id) => handleStartMeeting("CEO_STANDUP_MEETING")} />

      {/* Participation Indicator */}
      <ParticipationIndicator />

      {/* Action Items */}
      <ActionItems />

      {/* Meeting Notes Archive */}
      <MeetingNotes />
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Historique des Réunions
          </CardTitle>
          <CardDescription>
            Comptes-rendus et résumés des réunions passées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : meetingRuns && meetingRuns.length > 0 ? (
            <div className="space-y-4">
              {meetingRuns.map((run) => (
                <div 
                  key={run.id} 
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {run.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {run.run_type.replace(/_/g, " ")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(run.created_at).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={run.status === "completed" ? "success" : "subtle"}>
                      {run.status === "completed" ? "Terminé" : run.status}
                    </Badge>
                  </div>
                  {run.executive_summary && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <p className="line-clamp-3">{run.executive_summary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucune réunion enregistrée</p>
              <p className="text-sm mt-1">Lancez une réunion pour générer un compte-rendu.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
