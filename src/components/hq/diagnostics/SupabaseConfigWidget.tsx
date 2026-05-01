import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw, Database } from "lucide-react";
import {
  getCachedBootDiagnostics,
  pingSupabase,
  type BootDiagnostics,
} from "@/lib/supabaseBoot";

/**
 * Widget de diagnostic configuration Supabase pour la page /hq/diagnostics.
 * Indique les variables présentes, l'origine (env ou fallback) et permet
 * un ping manuel.
 */
export const SupabaseConfigWidget = () => {
  const [diag] = useState<BootDiagnostics>(() => getCachedBootDiagnostics());
  const [ping, setPing] = useState<{ ok: boolean; latencyMs: number; error?: string } | null>(
    null,
  );
  const [pinging, setPinging] = useState(false);

  const runPing = async () => {
    setPinging(true);
    setPing(await pingSupabase(diag));
    setPinging(false);
  };

  // Auto-ping au montage pour donner un statut immédiat.
  useEffect(() => {
    void runPing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Item = ({ label, ok, value }: { label: string; ok: boolean; value: string }) => (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium truncate max-w-[55%]">{value}</span>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Configuration Supabase
          </CardTitle>
          <CardDescription>
            État des variables import.meta.env et ping de l'API
          </CardDescription>
        </div>
        <Badge variant={diag.issues.length === 0 ? "default" : "destructive"}>
          {diag.issues.length === 0 ? "OK" : `${diag.issues.length} problème(s)`}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <Item label="VITE_SUPABASE_URL" ok={diag.hasUrl} value={diag.hasUrl ? "présente" : "manquante"} />
        <Item
          label="VITE_SUPABASE_PUBLISHABLE_KEY"
          ok={diag.hasKey}
          value={diag.hasKey ? "présente" : "manquante"}
        />
        <Item label="URL Supabase" ok={diag.hasUrl} value={diag.url ?? "—"} />
        <Item
          label="Source URL"
          ok={true}
          value={diag.urlFromFallback ? "fallback prod" : "import.meta.env"}
        />
        <Item
          label="Source clé anon"
          ok={true}
          value={diag.keyFromFallback ? "fallback prod" : "import.meta.env"}
        />
        <Item label="Mode build" ok={true} value={diag.mode} />

        <div className="flex items-center justify-between pt-3">
          <div className="text-sm">
            {ping ? (
              ping.ok ? (
                <span className="text-emerald-500">
                  ✅ Ping OK · {ping.latencyMs} ms
                </span>
              ) : (
                <span className="text-destructive">
                  ❌ {ping.error ?? "Ping échoué"} · {ping.latencyMs} ms
                </span>
              )
            ) : (
              <span className="text-muted-foreground">Ping en attente…</span>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={runPing} disabled={pinging}>
            <RefreshCw className={`h-3 w-3 mr-2 ${pinging ? "animate-spin" : ""}`} />
            Re-ping
          </Button>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          Session ID : <code className="font-mono">{diag.sessionId}</code>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConfigWidget;