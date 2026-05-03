import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudioCalls } from "@/hooks/useStudio";
import {
  CALL_STATUS_LABEL,
  CALL_TYPE_LABEL,
  type StudioCallStatus,
} from "@/lib/studio-types";
import { CalendarClock, Megaphone, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<StudioCallStatus, string> = {
  to_analyze: "bg-muted text-muted-foreground",
  relevant: "bg-success/10 text-success",
  not_relevant: "bg-destructive/10 text-destructive",
  blueprint_in_progress: "bg-primary/10 text-primary",
  response_in_preparation: "bg-warning/15 text-warning",
  submitted: "bg-accent/10 text-accent",
  won: "bg-success/15 text-success",
  lost: "bg-destructive/10 text-destructive",
  recycle: "bg-muted text-muted-foreground",
};

function deadlineTone(deadline: string | null): string | undefined {
  if (!deadline) return undefined;
  const days = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "text-destructive";
  if (days < 14) return "text-warning";
  if (days < 30) return "text-primary";
  return undefined;
}

export function CallForProjectsTable() {
  const { data, isLoading } = useStudioCalls();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const items = data ?? [];
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.issuer ?? "").toLowerCase().includes(q) ||
        (c.domain ?? "").toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4 text-primary" />
            Appels à projets / appels d'offres / AMI
          </CardTitle>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un appel…"
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Aucun appel enregistré. Ajoutez-en un pour démarrer l'analyse.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Titre</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Émetteur</TableHead>
                  <TableHead className="text-xs">Domaine</TableHead>
                  <TableHead className="text-xs">Échéance</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium text-sm">{call.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {CALL_TYPE_LABEL[call.call_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {call.issuer ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {call.domain ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1 text-xs tabular-nums", deadlineTone(call.deadline))}>
                        {call.deadline ? (
                          <>
                            <CalendarClock className="h-3 w-3" />
                            {new Date(call.deadline).toLocaleDateString("fr-FR")}
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[call.status])}>
                        {CALL_STATUS_LABEL[call.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
