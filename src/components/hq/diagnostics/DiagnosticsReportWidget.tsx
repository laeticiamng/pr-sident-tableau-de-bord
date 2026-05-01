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
  method: string;
  status: number | null;
  duration_ms: number | null;
  ts: string;
  source: "fetch" | "performance";
  resource_type?: string;
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
  capture_status: {
    console_hook: boolean;
    fetch_hook: boolean;
    performance_observer: boolean;
    notes: string[];
  };
  recent_console_errors: ConsoleSnapshot[];
  recent_network_errors: NetworkSnapshot[];
  consent: {
    given: boolean;
    given_at: string | null;
  };
}

// Capture global - démarre dès l'import du module.
const consoleBuffer: ConsoleSnapshot[] = [];
const networkBuffer: NetworkSnapshot[] = [];
const MAX_BUFFER = 30;
const captureStatus = {
  console_hook: false,
  fetch_hook: false,
  performance_observer: false,
  notes: [] as string[],
};

function pushNetwork(entry: NetworkSnapshot) {
  networkBuffer.push(entry);
  if (networkBuffer.length > MAX_BUFFER) networkBuffer.shift();
}

function safeUrl(input: unknown): string {
  try {
    if (typeof input === "string") return input.slice(0, 300);
    if (input instanceof URL) return input.toString().slice(0, 300);
    if (input && typeof (input as Request).url === "string") {
      return (input as Request).url.slice(0, 300);
    }
  } catch { /* noop */ }
  return "(unknown url)";
}

function safeMethod(input: unknown, init?: RequestInit): string {
  try {
    if (init?.method) return String(init.method).toUpperCase();
    if (input instanceof Request) return input.method.toUpperCase();
  } catch { /* noop */ }
  return "GET";
}

(function installCaptureOnce() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __ec_diag_installed?: boolean };
  if (w.__ec_diag_installed) return;
  w.__ec_diag_installed = true;

  // 1) Console hook (console.error / console.warn) — best-effort
  try {
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
      try { origError(...args); } catch { /* noop */ }
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
      try { origWarn(...args); } catch { /* noop */ }
    };
    captureStatus.console_hook = true;
  } catch (e) {
    captureStatus.notes.push(`console hook indisponible: ${String((e as Error)?.message ?? e)}`);
  }

  // 2) Fetch hook — capture endpoint, méthode, status, durée
  try {
    const origFetch = window.fetch?.bind(window);
    if (origFetch) {
      window.fetch = async (...args: Parameters<typeof fetch>) => {
        const start = (typeof performance !== "undefined" ? performance.now() : Date.now());
        const url = safeUrl(args[0]);
        const method = safeMethod(args[0], args[1]);
        try {
          const res = await origFetch(...args);
          if (!res.ok) {
            pushNetwork({
              url, method,
              status: res.status,
              duration_ms: Math.round(((typeof performance !== "undefined" ? performance.now() : Date.now())) - start),
              ts: new Date().toISOString(),
              source: "fetch",
            });
          }
          return res;
        } catch (e) {
          pushNetwork({
            url, method,
            status: null,
            duration_ms: Math.round(((typeof performance !== "undefined" ? performance.now() : Date.now())) - start),
            ts: new Date().toISOString(),
            source: "fetch",
          });
          throw e;
        }
      };
      captureStatus.fetch_hook = true;
    } else {
      captureStatus.notes.push("fetch hook indisponible: window.fetch absent");
    }
  } catch (e) {
    captureStatus.notes.push(`fetch hook indisponible: ${String((e as Error)?.message ?? e)}`);
  }

  // 3) PerformanceObserver — fallback / source secondaire (capte aussi
  // XHR + ressources statiques même si fetch est blindé par une extension).
  try {
    if (typeof PerformanceObserver !== "undefined") {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          try {
            const e = entry as PerformanceResourceTiming;
            // Capture les erreurs réseau applicatives et ressources statiques
            // (JS/CSS/chunks) même si fetch est blindé par une extension.
            const status = (e as PerformanceResourceTiming & { responseStatus?: number }).responseStatus ?? null;
            const initiator = e.initiatorType || "resource";
            const isError =
              (status !== null && status >= 400) ||
              (status === null && e.transferSize === 0 && ["script", "link", "css", "fetch", "xmlhttprequest"].includes(initiator));
            if (!isError) continue;
            pushNetwork({
              url: String(e.name).slice(0, 300),
              method: initiator === "fetch" || initiator === "xmlhttprequest" ? "?" : "GET",
              status,
              duration_ms: Math.round(e.duration),
              ts: new Date(performance.timeOrigin + e.startTime).toISOString(),
              source: "performance",
              resource_type: initiator,
            });
          } catch { /* noop */ }
        }
      });
      obs.observe({ type: "resource", buffered: true });
      captureStatus.performance_observer = true;
    } else {
      captureStatus.notes.push("PerformanceObserver indisponible");
    }
  } catch (e) {
    captureStatus.notes.push(`PerformanceObserver KO: ${String((e as Error)?.message ?? e)}`);
  }
})();

async function buildReport(consentState: { given: boolean; given_at: string | null }): Promise<DiagnosticsReport> {
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

  let manifestLink: string | null = null;
  try {
    manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href ?? null;
  } catch { /* noop */ }
  let standalone = false;
  try {
    standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
  } catch { /* noop */ }

  return {
    generated_at: new Date().toISOString(),
    build_version: (window as unknown as { __APP_BUILD__?: string }).__APP_BUILD__ ?? import.meta.env.MODE,
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
    capture_status: { ...captureStatus, notes: [...captureStatus.notes] },
    recent_console_errors: [...consoleBuffer],
    recent_network_errors: [...networkBuffer],
    consent: { ...consentState },
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
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setSent(false);
    setError(null);
    try {
      const r = await buildReport({ given: consent, given_at: consentAt });
      setReport(r);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { void generate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handleConsentChange = (v: boolean) => {
    setConsent(v);
    setConsentAt(v ? new Date().toISOString() : null);
    setSent(false);
  };

  const send = async () => {
    // Défense en profondeur : on revérifie à la fois l'état React et un
    // snapshot horodaté du consentement avant tout envoi réseau.
    if (!report) return;
    if (!consent || !consentAt) {
      setError("Consentement requis : cochez la case avant l'envoi.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const reportWithConsent: DiagnosticsReport = {
        ...report,
        consent: { given: true, given_at: consentAt },
      };
      const summary = JSON.stringify(reportWithConsent).slice(0, 1000);
      const { error: insertError } = await supabase.from("client_error_logs").insert({
        error_type: "boot",
        message: `[diagnostics-report consent=${consentAt}] ${summary}`,
        page_path: report.url,
        build_version: report.build_version,
        has_service_worker: report.pwa.has_service_worker,
        in_iframe: report.in_iframe,
        user_agent: report.user_agent,
      });
      if (insertError) throw insertError;
      void logClientError("boot", `diagnostics-report sent (consent_at=${consentAt})`);
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
                        <span className="text-destructive">[{e.status ?? "ERR"}]</span>{" "}
                        <span className="text-muted-foreground">{e.method}</span>{" "}
                        {e.url}
                        {e.duration_ms !== null && (
                          <span className="text-muted-foreground"> · {e.duration_ms}ms</span>
                        )}
                        <span className="text-[10px] text-muted-foreground/70"> ({e.source})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* État de la capture — utile pour comprendre pourquoi le rapport
                est vide si une extension bloque les hooks. */}
            {(!report.capture_status.console_hook ||
              !report.capture_status.fetch_hook ||
              report.capture_status.notes.length > 0) && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs space-y-1">
                <p className="font-medium text-warning">Capture partielle</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>console.error/warn : {report.capture_status.console_hook ? "OK" : "bloqué"}</li>
                  <li>fetch hook : {report.capture_status.fetch_hook ? "OK" : "bloqué"}</li>
                  <li>PerformanceObserver : {report.capture_status.performance_observer ? "OK" : "indisponible"}</li>
                  {report.capture_status.notes.map((n, i) => (
                    <li key={i} className="font-mono">• {n}</li>
                  ))}
                </ul>
              </div>
            )}

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
                  {consent && consentAt && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Consentement donné à <code>{new Date(consentAt).toLocaleTimeString("fr-FR")}</code>.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="diag-consent"
                  checked={consent}
                  onCheckedChange={(v) => handleConsentChange(Boolean(v))}
                />
                <Label htmlFor="diag-consent" className="text-sm font-normal cursor-pointer">
                  J'accepte d'envoyer ce rapport à l'audit log
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void send()}
                  disabled={!consent || !consentAt || sending || sent}
                  aria-disabled={!consent || !consentAt || sending || sent}
                >
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
