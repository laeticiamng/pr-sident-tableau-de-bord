import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw, Bug, Cog, AlertCircle, Hash, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientErrorRow {
  id: string;
  error_type: string;
  message: string;
  page_path: string | null;
  build_version: string | null;
  has_service_worker: boolean | null;
  in_iframe: boolean | null;
  created_at: string;
}

const TYPE_META: Record<string, { label: string; variant: "destructive" | "secondary" | "outline"; icon: typeof Bug }> = {
  chunk_load: { label: "Chunk JS", variant: "destructive", icon: Hash },
  service_worker: { label: "Service Worker", variant: "destructive", icon: Cog },
  react_render: { label: "Render React", variant: "destructive", icon: Bug },
  unhandled_rejection: { label: "Promise non gérée", variant: "secondary", icon: AlertCircle },
  boot: { label: "Boot", variant: "outline", icon: Globe },
};

/**
 * Widget HQ — affiche le journal des erreurs côté client (chunks JS,
 * Service Worker, écran noir, unhandled rejections). Source :
 * `public.client_error_logs`. Lecture restreinte par RLS au compte
 * propriétaire.
 */
export function ClientErrorsWidget() {
  const [rows, setRows] = useState<ClientErrorRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("client_error_logs")
      .select("id,error_type,message,page_path,build_version,has_service_worker,in_iframe,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (err) {
      setError(err.message);
      setRows([]);
    } else {
      setRows((data ?? []) as ClientErrorRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
            Erreurs côté client (50 dernières)
          </CardTitle>
          <CardDescription>
            Chunks JS, Service Worker, écrans noirs et promesses non gérées —
            collectés en temps réel depuis tous les visiteurs.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {loading && rows === null && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive">Erreur de chargement : {error}</p>
        )}
        {rows && rows.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">
            Aucune erreur client signalée. Tout va bien ✅
          </p>
        )}
        {rows && rows.length > 0 && (
          <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {rows.map((r) => {
              const meta = TYPE_META[r.error_type] ?? { label: r.error_type, variant: "outline" as const, icon: Bug };
              const Icon = meta.icon;
              return (
                <li key={r.id} className="rounded-lg border border-border/60 bg-secondary/20 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge variant={meta.variant} className="gap-1">
                      <Icon className="h-3 w-3" aria-hidden />
                      {meta.label}
                    </Badge>
                    {r.has_service_worker && (
                      <Badge variant="outline" className="text-[10px]">SW actif</Badge>
                    )}
                    {r.in_iframe && (
                      <Badge variant="outline" className="text-[10px]">iframe</Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <p className="font-mono text-xs break-words text-foreground/90">
                    {r.message}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-[11px] text-muted-foreground">
                    {r.page_path && <span>Route : <code>{r.page_path}</code></span>}
                    {r.build_version && <span>Build : <code>{r.build_version}</code></span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default ClientErrorsWidget;