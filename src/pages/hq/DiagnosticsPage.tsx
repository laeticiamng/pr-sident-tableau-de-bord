import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Server, 
  User, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Wifi,
  WifiOff,
  Zap,
  HardDrive
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "error" | "unknown";
  latency?: number;
  message?: string;
  lastChecked?: Date;
}

interface APIError {
  timestamp: Date;
  endpoint: string;
  status: number;
  message: string;
}

export default function DiagnosticsPage() {
  const { user, session } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [recentErrors, setRecentErrors] = useState<APIError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [avgLatency, setAvgLatency] = useState<number | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Run health checks
  const runHealthChecks = async () => {
    setIsChecking(true);
    const checks: HealthCheck[] = [];
    const latencies: number[] = [];

    // Check Supabase Database
    try {
      const start = performance.now();
      const { error } = await supabase.rpc("get_all_hq_platforms");
      const latency = Math.round(performance.now() - start);
      latencies.push(latency);
      
      checks.push({
        name: "Database (Supabase)",
        status: error ? "degraded" : "healthy",
        latency,
        message: error?.message || "Connected",
        lastChecked: new Date(),
      });
    } catch (e) {
      checks.push({
        name: "Database (Supabase)",
        status: "error",
        message: e instanceof Error ? e.message : "Connection failed",
        lastChecked: new Date(),
      });
    }

    // Check Auth Status
    try {
      const start = performance.now();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const latency = Math.round(performance.now() - start);
      latencies.push(latency);
      
      checks.push({
        name: "Authentication",
        status: currentSession ? "healthy" : "degraded",
        latency,
        message: currentSession ? "Authenticated" : "Not authenticated",
        lastChecked: new Date(),
      });
    } catch (e) {
      checks.push({
        name: "Authentication",
        status: "error",
        message: "Auth check failed",
        lastChecked: new Date(),
      });
    }

    // Check Edge Functions
    try {
      const start = performance.now();
      const { data, error } = await supabase.functions.invoke("platform-monitor", {
        body: { action: "health" },
      });
      const latency = Math.round(performance.now() - start);
      latencies.push(latency);
      
      checks.push({
        name: "Edge Functions",
        status: error ? "degraded" : "healthy",
        latency,
        message: error?.message || "Operational",
        lastChecked: new Date(),
      });
    } catch (e) {
      checks.push({
        name: "Edge Functions",
        status: "unknown",
        message: "Edge function check skipped",
        lastChecked: new Date(),
      });
    }

    // Check Realtime
    try {
      const start = performance.now();
      const channel = supabase.channel("diagnostics-test");
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);
        channel.subscribe((status) => {
          clearTimeout(timeout);
          resolve();
        });
      });
      const latency = Math.round(performance.now() - start);
      latencies.push(latency);
      await supabase.removeChannel(channel);
      
      checks.push({
        name: "Realtime",
        status: "healthy",
        latency,
        message: "Connected",
        lastChecked: new Date(),
      });
    } catch (e) {
      checks.push({
        name: "Realtime",
        status: "degraded",
        message: "Connection timeout",
        lastChecked: new Date(),
      });
    }

    setHealthChecks(checks);
    setAvgLatency(latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null);
    setIsChecking(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-success" />;
      case "degraded": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy": return <Badge variant="success">Sain</Badge>;
      case "degraded": return <Badge variant="warning">Dégradé</Badge>;
      case "error": return <Badge variant="destructive">Erreur</Badge>;
      default: return <Badge variant="subtle">Inconnu</Badge>;
    }
  };

  const overallStatus = healthChecks.every(c => c.status === "healthy") 
    ? "healthy" 
    : healthChecks.some(c => c.status === "error") 
    ? "error" 
    : "degraded";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Diagnostics Système</h1>
          <p className="text-muted-foreground text-lg">
            État de santé et métriques de performance du HQ.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={runHealthChecks}
          disabled={isChecking}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
          Relancer les tests
        </Button>
      </div>

      {/* Global Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={`card-executive border-2 ${
          overallStatus === "healthy" ? "border-success/30" :
          overallStatus === "error" ? "border-destructive/30" : "border-warning/30"
        }`}>
          <CardContent className="p-6 text-center">
            <Activity className={`h-8 w-8 mx-auto mb-3 ${
              overallStatus === "healthy" ? "text-success" :
              overallStatus === "error" ? "text-destructive" : "text-warning"
            }`} />
            <div className="text-xl font-bold capitalize">
              {overallStatus === "healthy" ? "Opérationnel" :
               overallStatus === "error" ? "Critique" : "Dégradé"}
            </div>
            <div className="text-sm text-muted-foreground">Statut Global</div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            {isOnline ? (
              <Wifi className="h-8 w-8 mx-auto mb-3 text-success" />
            ) : (
              <WifiOff className="h-8 w-8 mx-auto mb-3 text-destructive" />
            )}
            <div className="text-xl font-bold">{isOnline ? "En ligne" : "Hors ligne"}</div>
            <div className="text-sm text-muted-foreground">Connectivité</div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-3 text-primary" />
            <div className="text-xl font-bold font-mono">
              {avgLatency !== null ? `${avgLatency}ms` : "—"}
            </div>
            <div className="text-sm text-muted-foreground">Latence Moyenne</div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <HardDrive className="h-8 w-8 mx-auto mb-3 text-primary" />
            <div className="text-xl font-bold">{healthChecks.filter(c => c.status === "healthy").length}/{healthChecks.length}</div>
            <div className="text-sm text-muted-foreground">Services Sains</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Context */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              Contexte Utilisateur
            </CardTitle>
            <CardDescription>
              Informations de session actuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg border">
                <dt className="text-muted-foreground">User ID</dt>
                <dd className="font-mono text-xs">{user?.id || "Non connecté"}</dd>
              </div>
              <div className="flex justify-between p-3 rounded-lg border">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{user?.email || "—"}</dd>
              </div>
              <div className="flex justify-between p-3 rounded-lg border">
                <dt className="text-muted-foreground">Session Active</dt>
                <dd>
                  <Badge variant={session ? "success" : "destructive"}>
                    {session ? "Oui" : "Non"}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between p-3 rounded-lg border">
                <dt className="text-muted-foreground">Token Expire</dt>
                <dd className="font-mono text-xs">
                  {session?.expires_at 
                    ? new Date(session.expires_at * 1000).toLocaleString("fr-FR")
                    : "—"
                  }
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Environment */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Server className="h-5 w-5 text-primary" />
              Environnement
            </CardTitle>
            <CardDescription>
              Configuration système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg border">
                <dt className="text-muted-foreground">Environnement</dt>
                <dd>
                  <Badge variant="gold">Production</Badge>
                </dd>
              </div>
              <div className="flex justify-between p-3 rounded-lg border">
                <dt className="text-muted-foreground">Build</dt>
                <dd className="font-mono text-xs">{import.meta.env.MODE}</dd>
              </div>
              <div className="flex justify-between p-3 rounded-lg border">
                <dt className="text-muted-foreground">User Agent</dt>
                <dd className="font-mono text-xs max-w-[200px] truncate" title={navigator.userAgent}>
                  {navigator.userAgent.split(" ").slice(-1)[0]}
                </dd>
              </div>
              <div className="flex justify-between p-3 rounded-lg border">
                <dt className="text-muted-foreground">Timezone</dt>
                <dd className="font-mono text-xs">{Intl.DateTimeFormat().resolvedOptions().timeZone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            Vérifications de Santé
          </CardTitle>
          <CardDescription>
            État des services backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isChecking ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {healthChecks.map((check) => (
                <div key={check.name} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(check.status)}
                    <div>
                      <h4 className="font-medium">{check.name}</h4>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {check.latency && (
                      <span className="font-mono text-sm text-muted-foreground">
                        {check.latency}ms
                      </span>
                    )}
                    {getStatusBadge(check.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Erreurs Récentes
          </CardTitle>
          <CardDescription>
            Dernières erreurs API captées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentErrors.length > 0 ? (
            <div className="space-y-3">
              {recentErrors.map((error, index) => (
                <div key={index} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{error.endpoint}</span>
                    <Badge variant="destructive">HTTP {error.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{error.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {error.timestamp.toLocaleString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
              <p className="text-lg font-medium">Aucune erreur récente</p>
              <p className="text-sm mt-1">Le système fonctionne correctement.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
