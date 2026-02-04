import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

const PARTICIPATION_DATA = {
  overall: {
    rate: 94,
    trend: 2.5,
  },
  byMeetingType: [
    { type: "Standup DG", rate: 100, attendees: 5, total: 5 },
    { type: "Revue Exécutive", rate: 92, attendees: 11, total: 12 },
    { type: "Directeurs Plateforme", rate: 90, attendees: 9, total: 10 },
    { type: "Comité Stratégique", rate: 88, attendees: 7, total: 8 },
  ],
  topParticipants: [
    { name: "CFO Agent", rate: 100 },
    { name: "CMO Agent", rate: 98 },
    { name: "CTO Agent", rate: 95 },
  ],
};

export function ParticipationIndicator() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          Indicateur de Participation
        </CardTitle>
        <CardDescription>
          Taux de présence aux réunions exécutives
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall Rate */}
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent text-center">
          <p className="text-5xl font-bold text-primary">{PARTICIPATION_DATA.overall.rate}%</p>
          <p className="text-sm text-muted-foreground mt-1">Taux de participation global</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-success text-xs">
            <TrendingUp className="h-3 w-3" />
            <span>+{PARTICIPATION_DATA.overall.trend}% vs mois dernier</span>
          </div>
        </div>

        {/* By Meeting Type */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-muted-foreground">Par type de réunion</h4>
          {PARTICIPATION_DATA.byMeetingType.map((meeting) => (
            <div key={meeting.type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{meeting.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {meeting.attendees}/{meeting.total}
                  </span>
                  <Badge 
                    variant={meeting.rate >= 95 ? "success" : meeting.rate >= 80 ? "default" : "warning"}
                    className="font-mono"
                  >
                    {meeting.rate}%
                  </Badge>
                </div>
              </div>
              <Progress value={meeting.rate} className="h-2" />
            </div>
          ))}
        </div>

        {/* Top Participants */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Meilleurs participants</h4>
          <div className="flex items-center gap-2">
            {PARTICIPATION_DATA.topParticipants.map((participant, index) => (
              <div 
                key={participant.name}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <span className="text-sm">{participant.name}</span>
                <Badge variant="subtle" className="text-xs">{participant.rate}%</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
