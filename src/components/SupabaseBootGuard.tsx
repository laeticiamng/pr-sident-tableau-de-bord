import { useEffect, useState, type ReactNode } from "react";
import {
  collectBootDiagnostics,
  logBootIssues,
  pingSupabase,
  type BootDiagnostics,
} from "@/lib/supabaseBoot";

/**
 * Garde-fou au démarrage : si la configuration Supabase est manquante ou
 * invalide, affiche un écran de diagnostic owner-friendly au lieu d'un
 * écran noir. Sinon rend simplement les enfants.
 */
export const SupabaseBootGuard = ({ children }: { children: ReactNode }) => {
  const [diag] = useState<BootDiagnostics>(() => collectBootDiagnostics());
  const [ping, setPing] = useState<{
    ok: boolean;
    latencyMs: number;
    error?: string;
  } | null>(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    logBootIssues(diag);
  }, [diag]);

  // Si la config est OK, on n'affiche rien : le bug-screen est silencieux.
  if (diag.issues.length === 0) {
    return <>{children}</>;
  }

  const runPing = async () => {
    setPinging(true);
    const result = await pingSupabase(diag);
    setPing(result);
    setPinging(false);
  };

  const Row = ({ label, value, ok }: { label: string; value: string; ok: boolean }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 14px",
        borderRadius: 8,
        background: ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.10)",
        border: `1px solid ${ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.30)"}`,
        fontSize: 14,
      }}
    >
      <span style={{ opacity: 0.85 }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0a0a14,#10131c 60%,#0a0a14)",
        color: "#fff",
        fontFamily:
          'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
        padding: "48px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 32,
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.6,
            marginBottom: 12,
          }}
        >
          EmotionsCare HQ · Diagnostic
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 8px", fontWeight: 600 }}>
          Configuration backend incomplète
        </h1>
        <p style={{ opacity: 0.75, margin: "0 0 24px", lineHeight: 1.6 }}>
          L'application n'a pas pu se connecter à Lovable Cloud. Voici l'état
          actuel de la configuration. Cet écran remplace l'écran noir pour
          faciliter le diagnostic.
        </p>

        <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
          <Row
            label="VITE_SUPABASE_URL"
            value={diag.hasUrl ? "présente" : "manquante"}
            ok={diag.hasUrl}
          />
          <Row
            label="VITE_SUPABASE_PUBLISHABLE_KEY"
            value={diag.hasKey ? "présente" : "manquante"}
            ok={diag.hasKey}
          />
          <Row
            label="URL Supabase"
            value={diag.url ?? "—"}
            ok={diag.hasUrl}
          />
          <Row label="Mode build" value={diag.mode} ok={true} />
          <Row
            label="Source URL"
            value={diag.urlFromFallback ? "fallback prod" : "import.meta.env"}
            ok={true}
          />
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <button
            type="button"
            onClick={runPing}
            disabled={pinging || !diag.hasUrl}
            style={{
              background: "#fff",
              color: "#0a0a14",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 600,
              cursor: pinging || !diag.hasUrl ? "not-allowed" : "pointer",
              opacity: pinging || !diag.hasUrl ? 0.6 : 1,
            }}
          >
            {pinging ? "Ping en cours…" : "Ping Supabase"}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 8,
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Recharger
          </button>
        </div>

        {ping && (
          <div
            style={{
              fontSize: 13,
              padding: "10px 14px",
              borderRadius: 8,
              background: ping.ok
                ? "rgba(34,197,94,0.10)"
                : "rgba(239,68,68,0.10)",
              border: `1px solid ${
                ping.ok ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.30)"
              }`,
              marginBottom: 16,
            }}
          >
            {ping.ok
              ? `✅ Ping OK (${ping.latencyMs} ms)`
              : `❌ Ping échoué — ${ping.error ?? "erreur inconnue"} (${ping.latencyMs} ms)`}
          </div>
        )}

        <div
          style={{
            fontSize: 11,
            opacity: 0.5,
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          Session ID : <code>{diag.sessionId}</code>
          <br />
          Communiquez cet ID au support pour accélérer le diagnostic.
        </div>
      </div>
    </div>
  );
};

export default SupabaseBootGuard;