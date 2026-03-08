import { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, CheckCircle2, Clock, Database } from "lucide-react";
import { useJournalEntries, type JournalEntry } from "@/hooks/useJournal";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const typeLabels: Record<string, string> = {
  decision: "Décision",
  note: "Note",
  milestone: "Jalon",
  reflection: "Réflexion",
};

const typeColors: Record<string, string> = {
  decision: "bg-accent/10 text-accent",
  note: "bg-muted text-muted-foreground",
  milestone: "bg-success/10 text-success",
  reflection: "bg-primary/10 text-primary",
};

export const RecentDecisionsWidget = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { data: entries, isLoading } = useJournalEntries();

  const recent = (entries || []).slice(0, 3);

  if (isLoading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Décisions récentes</h3>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recent.length === 0) {
    return (
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardContent className="p-6 text-center">
          <Database className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-muted-foreground">Aucune décision enregistrée</h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Consignez vos décisions dans le{" "}
            <Link to="/hq/journal" className="text-accent underline">Journal Présidentiel</Link>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Décisions récentes</h3>
          </div>
          <Link to="/hq/journal" className="text-xs text-accent hover:underline flex items-center gap-1">
            Voir tout <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {recent.map((entry) => (
            <DecisionRow key={entry.id} entry={entry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

RecentDecisionsWidget.displayName = "RecentDecisionsWidget";

function DecisionRow({ entry }: { entry: JournalEntry }) {
  const hasImpact = !!entry.impact_measured?.summary;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${typeColors[entry.entry_type] || ""}`}>
            {typeLabels[entry.entry_type] || entry.entry_type}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>
        <p className="text-sm font-medium truncate">{entry.title}</p>
        {entry.tags.length > 0 && (
          <div className="flex gap-1 mt-1">
            {entry.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        {hasImpact ? (
          <Badge variant="outline" className="text-[9px] gap-1 bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Impact mesuré
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[9px] gap-1 bg-warning/10 text-warning border-warning/20">
            <Clock className="h-2.5 w-2.5" />
            En attente
          </Badge>
        )}
      </div>
    </div>
  );
}
