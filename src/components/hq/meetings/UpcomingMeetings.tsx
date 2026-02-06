import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Database } from "lucide-react";

interface UpcomingMeetingsProps {
  onStartMeeting?: (meetingId: string) => void;
}

export function UpcomingMeetings({ onStartMeeting }: UpcomingMeetingsProps) {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Agenda des Réunions
        </CardTitle>
        <CardDescription>Prochaines réunions planifiées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucune réunion planifiée</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Les réunions apparaîtront ici une fois configurées dans l'agenda
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
