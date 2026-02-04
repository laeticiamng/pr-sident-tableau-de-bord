import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Tag, Download, Eye, Calendar, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  type: "standup" | "review" | "planning" | "external";
  attendees: string[];
  summary: string;
  actionItems: number;
  decisions: number;
  tags: string[];
}

const MEETING_NOTES: MeetingNote[] = [
  {
    id: "1",
    title: "Standup DG Quotidien",
    date: "2026-02-04T09:00:00Z",
    type: "standup",
    attendees: ["Présidente", "DG IA"],
    summary: "Revue des KPIs journaliers, validation du plan marketing Q1, discussion sur le recrutement.",
    actionItems: 3,
    decisions: 2,
    tags: ["KPIs", "Marketing"],
  },
  {
    id: "2",
    title: "Revue Exécutive Hebdo",
    date: "2026-02-03T14:00:00Z",
    type: "review",
    attendees: ["Présidente", "DG IA", "CFO", "CMO", "CTO"],
    summary: "Analyse financière mensuelle, roadmap produit Q1, validation budget marketing.",
    actionItems: 7,
    decisions: 4,
    tags: ["Finance", "Roadmap", "Budget"],
  },
  {
    id: "3",
    title: "Directeurs Plateforme",
    date: "2026-02-01T10:00:00Z",
    type: "planning",
    attendees: ["DG EmotionsCare", "DG Growth Copilot", "DG System Compass", "DG Med MNG", "DG Pixel Perfect"],
    summary: "Coordination inter-plateformes, partage des best practices, planning releases Q1.",
    actionItems: 5,
    decisions: 3,
    tags: ["Coordination", "Releases"],
  },
];

const typeLabels = {
  standup: "Standup",
  review: "Revue",
  planning: "Planning",
  external: "Externe",
};

const typeColors = {
  standup: "bg-blue-500/10 text-blue-600",
  review: "bg-purple-500/10 text-purple-600",
  planning: "bg-emerald-500/10 text-emerald-600",
  external: "bg-amber-500/10 text-amber-600",
};

export function MeetingNotes() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalActionItems = MEETING_NOTES.reduce((sum, n) => sum + n.actionItems, 0);
  const totalDecisions = MEETING_NOTES.reduce((sum, n) => sum + n.decisions, 0);

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              Notes de Réunion
            </CardTitle>
            <CardDescription>
              Comptes-rendus et décisions des dernières réunions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="subtle">{totalActionItems} actions</Badge>
            <Badge variant="gold">{totalDecisions} décisions</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {MEETING_NOTES.map((note) => (
            <div 
              key={note.id}
              className="p-4 rounded-lg border hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{note.title}</h4>
                    <Badge variant="outline" className={cn("text-xs", typeColors[note.type])}>
                      {typeLabels[note.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(note.date)}
                    </span>
                    <span>{note.attendees.length} participants</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {note.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="subtle" className="text-xs">
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-primary">
                    <ArrowUpRight className="h-3 w-3" />
                    {note.actionItems} actions
                  </span>
                  <span className="flex items-center gap-1 text-success">
                    {note.decisions} décisions
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Export Button */}
        <div className="mt-4 pt-4 border-t flex justify-end">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter tout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
