import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Lock, Key, ToggleLeft, ToggleRight, AlertOctagon } from "lucide-react";
import { useState } from "react";

export default function SecuritePage() {
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Centre de Sécurité</h1>
        <p className="text-muted-foreground text-lg">
          Supervision de la sécurité de l'ensemble des plateformes.
        </p>
      </div>

      {/* Panic Button & Autopilot */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-executive p-6 border-2 border-destructive/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertOctagon className="h-6 w-6 text-destructive" />
            <h2 className="text-xl font-semibold">Bouton Panique</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Désactive immédiatement toutes les actions automatiques des agents. 
            Utilisez uniquement en cas d'urgence.
          </p>
          <Button variant="destructive" size="lg" className="w-full">
            <AlertOctagon className="h-5 w-5" />
            ARRÊT D'URGENCE
          </Button>
        </div>

        <div className="card-executive p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {autopilotEnabled ? (
                <ToggleRight className="h-6 w-6 text-success" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              )}
              <h2 className="text-xl font-semibold">Mode Autopilot</h2>
            </div>
            <Badge variant={autopilotEnabled ? "success" : "subtle"}>
              {autopilotEnabled ? "Actif" : "Désactivé"}
            </Badge>
          </div>
          <p className="text-muted-foreground mb-6">
            Permet aux agents d'exécuter automatiquement les tâches à faible risque. 
            Les actions à risque élevé requièrent toujours votre approbation.
          </p>
          <Button 
            variant={autopilotEnabled ? "outline" : "executive"}
            className="w-full"
            onClick={() => setAutopilotEnabled(!autopilotEnabled)}
          >
            {autopilotEnabled ? "Désactiver Autopilot" : "Activer Autopilot"}
          </Button>
        </div>
      </div>

      {/* Security Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-executive p-6 text-center">
          <Shield className="h-8 w-8 mx-auto mb-3 text-success" />
          <div className="text-2xl font-bold text-success">Sécurisé</div>
          <div className="text-sm text-muted-foreground">Statut Global</div>
        </div>
        <div className="card-executive p-6 text-center">
          <Lock className="h-8 w-8 mx-auto mb-3 text-success" />
          <div className="text-2xl font-bold">5/5</div>
          <div className="text-sm text-muted-foreground">RLS Actif</div>
        </div>
        <div className="card-executive p-6 text-center">
          <Key className="h-8 w-8 mx-auto mb-3 text-primary" />
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">Secrets Stockés</div>
        </div>
        <div className="card-executive p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-warning" />
          <div className="text-2xl font-bold">1</div>
          <div className="text-sm text-muted-foreground">Alertes</div>
        </div>
      </div>

      {/* RLS Audit */}
      <div className="card-executive p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Audit RLS</h2>
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4" />
            Lancer un Audit
          </Button>
        </div>
        <div className="space-y-3">
          {[
            { table: "hq.platforms", status: "ok", lastCheck: "Il y a 1h" },
            { table: "hq.runs", status: "ok", lastCheck: "Il y a 1h" },
            { table: "hq.agents", status: "ok", lastCheck: "Il y a 1h" },
            { table: "hq.audit_logs", status: "ok", lastCheck: "Il y a 1h" },
            { table: "hq.approvals", status: "warning", lastCheck: "Il y a 2h", note: "Politique à réviser" },
          ].map((item) => (
            <div key={item.table} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                {item.status === "ok" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
                <span className="font-mono text-sm">{item.table}</span>
              </div>
              <div className="flex items-center gap-4">
                {item.note && <span className="text-sm text-warning">{item.note}</span>}
                <span className="text-sm text-muted-foreground">{item.lastCheck}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secrets Registry */}
      <div className="card-executive p-6">
        <h2 className="text-xl font-semibold mb-6">Registre des Secrets</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Les valeurs des secrets ne sont jamais affichées. Seuls les noms sont visibles.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "OPENAI_API_KEY",
            "ANTHROPIC_API_KEY",
            "GITHUB_TOKEN",
            "STRIPE_SECRET_KEY",
            "RESEND_API_KEY",
            "LOVABLE_API_KEY",
          ].map((secret) => (
            <div key={secret} className="flex items-center gap-3 p-3 rounded-lg border">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{secret}</span>
              <Badge variant="subtle" className="ml-auto">Configuré</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
