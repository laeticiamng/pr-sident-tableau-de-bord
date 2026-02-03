import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Users, Clock, MapPin, ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Meeting {
  id: string;
  title: string;
  type: "standup" | "review" | "planning" | "external";
  date: Date;
  duration: number; // minutes
  attendees: number;
  location?: string;
  isRecurring?: boolean;
  canStart?: boolean;
}

const UPCOMING_MEETINGS: Meeting[] = [
  {
    id: "1",
    title: "Standup DG Quotidien",
    type: "standup",
    date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h from now
    duration: 15,
    attendees: 2,
    location: "Visio",
    isRecurring: true,
    canStart: true,
  },
  {
    id: "2",
    title: "Revue Exécutive Hebdo",
    type: "review",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 60,
    attendees: 8,
    location: "Salle de Conseil",
    isRecurring: true,
  },
  {
    id: "3",
    title: "Directeurs Plateforme",
    type: "planning",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    duration: 45,
    attendees: 6,
    location: "Visio",
    isRecurring: true,
  },
  {
    id: "4",
    title: "Call Investisseur",
    type: "external",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
    duration: 30,
    attendees: 3,
    location: "Confidentiel",
  },
];

const typeColors = {
  standup: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  review: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  planning: "bg-green-500/10 text-green-600 border-green-500/30",
  external: "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

const typeLabels = {
  standup: "Standup",
  review: "Revue",
  planning: "Planning",
  external: "Externe",
};

interface UpcomingMeetingsProps {
  onStartMeeting?: (meetingId: string) => void;
}

export function UpcomingMeetings({ onStartMeeting }: UpcomingMeetingsProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 24) {
      return `Aujourd'hui à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (days === 1) {
      return `Demain à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    }
  };

  const isUpcoming = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return diff > 0 && diff < 3 * 60 * 60 * 1000; // Within 3 hours
  };

  return (
    <Card className="card-executive">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agenda des Réunions
          </CardTitle>
          <CardDescription>Prochaines réunions planifiées</CardDescription>
        </div>
        <Badge variant="subtle">{UPCOMING_MEETINGS.length} à venir</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {UPCOMING_MEETINGS.map((meeting) => {
            const upcoming = isUpcoming(meeting.date);
            return (
              <div 
                key={meeting.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  upcoming ? "border-primary/50 bg-primary/5 shadow-sm" : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{meeting.title}</h4>
                      <Badge variant="outline" className={cn("text-xs", typeColors[meeting.type])}>
                        {typeLabels[meeting.type]}
                      </Badge>
                      {meeting.isRecurring && (
                        <Badge variant="subtle" className="text-xs">
                          Récurrent
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(meeting.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meeting.attendees} participant{meeting.attendees > 1 ? "s" : ""}
                      </span>
                      {meeting.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {meeting.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {meeting.duration} min
                      </span>
                    </div>
                  </div>
                  {meeting.canStart && onStartMeeting && (
                    <Button 
                      size="sm" 
                      variant={upcoming ? "executive" : "outline"}
                      onClick={() => onStartMeeting(meeting.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {upcoming ? "Démarrer" : "Préparer"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
