import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ClipboardList, Download, Send, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logClientError } from "@/lib/clientErrorLogger";

interface ConsoleSnapshot {
  level: string;
  message: string;
  ts: string;
}

interface NetworkSnapshot {
  url: string;
  status: number | null;
  ts: string;
}

interface DiagnosticsReport {
  generated_at: string;
  build_version: string;
  app_mode: string;
  url: string;
  user_agent: string;
  online: boolean;
  language: string;
  timezone: string;
  pwa: {
    has_service_worker: boolean;
    sw_state: string | null;
    sw_scope: string | null;
    standalone: boolean;
    manifest_link: string | null;
  };
  in_iframe: boolean;
  recent_console_errors: ConsoleSnapshot[];
  recent_network_errors: NetworkSnapshot[];
}

// Capture global - démarre dès l'import du module.
const consoleBuffer: ConsoleSnapshot[] = [];
const networkBuffer: NetworkSnapshot[] = [];
const MAX_BUFFER = 30;

(function installCaptureOnce() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __ec_diag_installed?: boolean };
  if (w.__ec_diag_installed) return;
  w.__ec_diag_installed = true;

  const origError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    try {
      consoleBuffer.push({
        level: "error",
        message: args.map((a) => (a instanceof Error ? a.message : String(a))).join(" ").slice(0, 500),
        ts: new Date().toISOString(),
      });
      if (consoleBuffer.length > MAX_BUFFER) consoleBuffer.shift();
    } catch { /* noop */ }
    origError(...args);
  };

  const origWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    try {
      consoleBuffer.push({
        level: "warn",
        message: args.map((a) => String(a)).join(" ").slice(0, 500),
        ts: new Date().toISOString(),
      });
      if (consoleBuffer.length > MAX_BUFFER) consoleBuffer.shift();
    } catch { /* noop */ }
    origWarn(...args);
  };

  const origFetch = window.fetch?.bind(window);
  if (origFetch) {
    window.fetch = async (...args) => {
      try {
        const res = await origFetch(...args);
        if (!res.ok) {
          const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
          networkBuffer.push({ url: url.slice(0, 300), status: res.status, ts: new Date().toISOString() });
          if (networkBuffer.length > MAX_BUFFER) networkBuffer.shift();
        }
        return res;
      } catch (e) {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
        networkBuffer.push({ url: url.slice(0, 300), status: null, ts: new Date().toISOString() });
        if (networkBuffer.length > MAX_BUFFER) networkBuffer.shift();
        throw e;
      }
    };
  }
})();

async function buildReport(): Promise<DiagnosticsReport> {
  let swState: string | null = null;
  let swScope: string | null = null;
  let hasSw = false;
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      hasSw = Boolean(navigator.serviceWorker.controller);
      swScope = reg?.scope ?? null;
      swState = reg?.active?.state ?? reg?.installing?.state ?? reg?.waiting?.state ?? null;
    }
  } catch { /* noop */ }

  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href ?? null;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;

  return {
    generated_at: new Date().toISOString(),
    build_version: import.meta.env.MODE,
    app_mode: import.meta.env.MODE,
    url: window.location.href.slice(0, 500),
    user_agent: navigator.userAgent.slice(0, 500),
    online: navigator.onLine,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    pwa: {
      has_service_worker: hasSw,
      sw_state: swState,
      sw_scope: swScope,
      standalone,
      manifest_link: manifestLink,
    },
    in_iframe: (() => { try { return window.self !== window.top; } catch { return true; } })(),
    recent_console_errors: [...consoleBuffer],
    recent_network_errors: [...networkBuffer],
  };
}

/**
 * Widget HQ — Rapport Diagnostics.
 * Collecte build + état SW/PWA + dernières erreurs console/réseau,
 * affiche un aperçu, et envoie à l'audit log uniquement après
 * consentement explicite de l'opérateur.
 */
export function DiagnosticsReportWidget() {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setSent(false);
    setError(null);
    try {
      const r = await buildReport();
      setReport(r);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { void generate(); }, []);

  const send = async () => {
    if (!report || !consent) return;
    setSending(true);
    setError(null);
    try {
      const summary = JSON.stringify(report).slice(0, 1000);
      const { error: insertError } = await supabase.from("client_error_logs").insert({
        error_type: "boot",
        message: `[diagnostics-report] ${summary}`,
        page_path: report.url,
        build_version: report.build_version,
        has_service_worker: report.pwa.has_service_worker,
        in_iframe: report.in_iframe,
        user_agent: report.user_agent,
      });
      if (insertError) throw insertError;
      void logClientError("boot", "diagnostics-report sent (consent given)");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setSending(false);
    }
  };

  const downloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostics-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="card-executive">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" aria-hidden />
            Rapport Diagnostics HQ
          </CardTitle>
          <CardDescription>
            Build, Service Worker, PWA, dernières erreurs console et réseau.
            Envoi à l'audit log uniquement après consentement.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void generate()} disabled={generating}>
          {generating ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <ClipboardList className="h-3.5 w-3.5 mr-1.5" />}
          Régénérer
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {report && (
          <>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div className="rounded border p-3">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Build</div>
                <div className="font-mono">{report.build_version}</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Connexion</div>
                <div>{report.online ? "En ligne" : "Hors ligne"}</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Service Worker</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={report.pwa.has_service_worker ? "success" : "subtle"}>
                    {report.pwa.has_service_worker ? "Actif" : "Inactif"}
                  </Badge>
                  {report.pwa.sw_state && <Badge variant="outline" className="text-[10px]">{report.pwa.sw_state}</Badge>}
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">PWA</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={report.pwa.standalone ? "success" : "subtle"}>
                    {report.pwa.standalone ? "Mode standalone" : "Navigateur"}
                  </Badge>
                  {report.pwa.manifest_link && <Badge variant="outline" className="text-[10px]">manifest</Badge>}
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                  Erreurs console récentes ({report.recent_console_errors.length})
                </div>
                {report.recent_console_errors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune.</p>
                ) : (
                  <ul className="space-y-1 max-h-40 overflow-y-auto text-xs font-mono">
                    {report.recent_console_errors.slice(-10).map((e, i) => (
                      <li key={i} className="rounded bg-secondary/30 p-1.5 break-words">
                        <span className="text-destructive">[{e.level}]</span> {e.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                  Erreurs réseau récentes ({report.recent_network_errors.length})
                </div>
                {report.recent_network_errors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune.</p>
                ) : (
                  <ul className="space-y-1 max-h-40 overflow-y-auto text-xs font-mono">
                    {report.recent_network_errors.slice(-10).map((e, i) => (
                      <li key={i} className="rounded bg-secondary/30 p-1.5 break-words">
                        <span className="text-destructive">[{e.status ?? "ERR"}]</span> {e.url}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-secondary/20 p-3 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden />
                <div className="text-sm">
                  <p className="font-medium">Consentement requis avant envoi</p>
                  <p className="text-muted-foreground text-xs">
                    Le rapport peut contenir l'URL, le user-agent et les messages
                    d'erreurs récents. Il est stocké dans l'audit log et lisible
                    uniquement par la Présidente.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="diag-consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(Boolean(v))}
                />
                <Label htmlFor="diag-consent" className="text-sm font-normal cursor-pointer">
                  J'accepte d'envoyer ce rapport à l'audit log
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void send()} disabled={!consent || sending || sent}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                  ) : sent ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-success" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4 mr-2" aria-hidden />
                  )}
                  {sent ? "Rapport envoyé" : "Envoyer à l'audit log"}
                </Button>
                <Button variant="outline" onClick={downloadJson}>
                  <Download className="h-4 w-4 mr-2" aria-hidden />
                  Télécharger JSON
                </Button>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default DiagnosticsReportWidget;
