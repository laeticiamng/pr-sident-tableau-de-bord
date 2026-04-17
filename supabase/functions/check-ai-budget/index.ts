// Edge function : check-ai-budget
// Déclenchée par cron quotidien. Calcule le statut budget IA et envoie une notification push
// si le seuil d'alerte (par défaut 80%) est franchi et qu'aucune alerte n'a été envoyée
// dans les dernières 24h.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const CRON_SECRET = Deno.env.get("CRON_SECRET");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth : header X-Cron-Secret pour appels automatisés
    const cronHeader = req.headers.get("X-Cron-Secret");
    if (CRON_SECRET && cronHeader !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Lecture statut budget via RPC (utilise SECURITY DEFINER côté DB)
    // Note : on bypasse is_owner() en appelant via service_role, mais la RPC vérifie via auth.uid()
    // → on lit directement les données nécessaires en service_role pour le cron
    const { data: cfg } = await admin
      .schema("hq")
      .from("system_config")
      .select("value")
      .eq("key", "ai_budget")
      .maybeSingle();

    const budget = (cfg?.value as Record<string, unknown>) || {};
    const monthlyTarget = Number(budget.monthly_target_eur ?? 200);
    const alertThreshold = Number(budget.alert_threshold_pct ?? 80);
    const alertsEnabled = budget.alerts_enabled !== false;
    const lastAlertSentAt = budget.last_alert_sent_at as string | null;

    // Calcul coût mensuel réel
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const { data: runs } = await admin
      .schema("hq")
      .from("runs")
      .select("run_type")
      .gte("created_at", startOfMonth.toISOString())
      .eq("status", "completed");

    const COST: Record<string, number> = {
      DAILY_EXECUTIVE_BRIEF: 0.10, CEO_STANDUP_MEETING: 0.05, PLATFORM_STATUS_REVIEW: 0.02,
      SECURITY_AUDIT_RLS: 0.18, RELEASE_GATE_CHECK: 0.12, DEPLOY_TO_PRODUCTION: 0.15,
      RLS_POLICY_UPDATE: 0.20, COMPETITIVE_ANALYSIS: 0.25, QUALITY_AUDIT: 0.15,
      ADS_PERFORMANCE_REVIEW: 0.10, GROWTH_STRATEGY_REVIEW: 0.22, OKR_QUARTERLY_REVIEW: 0.08,
      COMPLIANCE_RGPD_CHECK: 0.16, SEO_AUDIT: 0.20, CONTENT_CALENDAR_PLAN: 0.06,
      REVENUE_FORECAST: 0.14, LEAD_SCORING_UPDATE: 0.07, FINANCIAL_REPORT: 0.12,
      RGPD_AUDIT: 0.16, VULNERABILITY_SCAN: 0.18, ROADMAP_UPDATE: 0.08,
      CODE_REVIEW: 0.12, DEPLOYMENT_CHECK: 0.06, DATA_INSIGHTS_REPORT: 0.14,
      AGENT_PERFORMANCE_REVIEW: 0.08, TECH_WATCH_REPORT: 0.10, MARKETING_WEEK_PLAN: 0.04,
      MASS_EMAIL_CAMPAIGN: 0.15, PRICING_CHANGE: 0.20,
    };

    const monthlyCost = (runs || []).reduce(
      (sum, r) => sum + (COST[r.run_type as string] ?? 0.05),
      0
    );
    const pctUsed = monthlyTarget > 0 ? (monthlyCost / monthlyTarget) * 100 : 0;
    const isAlert = pctUsed >= alertThreshold;

    // Anti-spam : pas plus d'1 alerte / 24h
    const recentAlert = lastAlertSentAt
      ? Date.now() - new Date(lastAlertSentAt).getTime() < 24 * 60 * 60 * 1000
      : false;

    let alertSent = false;
    if (isAlert && alertsEnabled && !recentAlert) {
      // Déclenchement notification push via fonction dédiée
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "💰 Budget IA — seuil 80% franchi",
            body: `Consommation mensuelle : ${monthlyCost.toFixed(2)}€ / ${monthlyTarget}€ (${pctUsed.toFixed(0)}%)`,
            url: "/hq/finance",
          }),
        });
        alertSent = true;

        // Mise à jour timestamp dernière alerte
        await admin
          .schema("hq")
          .from("system_config")
          .update({
            value: { ...budget, last_alert_sent_at: new Date().toISOString() },
          })
          .eq("key", "ai_budget");
      } catch (pushErr) {
        console.error("[check-ai-budget] Push notification failed:", pushErr);
      }
    }

    // Log structuré
    await admin.rpc("insert_hq_log", {
      p_level: isAlert ? "warn" : "info",
      p_source: "budget-monitor",
      p_message: isAlert ? "budget.alert_threshold_reached" : "budget.check_ok",
      p_metadata: {
        monthly_cost_eur: Math.round(monthlyCost * 100) / 100,
        monthly_target_eur: monthlyTarget,
        pct_used: Math.round(pctUsed * 10) / 10,
        is_alert: isAlert,
        alert_sent: alertSent,
        recent_alert_skipped: recentAlert,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        monthly_cost_eur: Math.round(monthlyCost * 100) / 100,
        monthly_target_eur: monthlyTarget,
        pct_used: Math.round(pctUsed * 10) / 10,
        is_alert: isAlert,
        alert_sent: alertSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[check-ai-budget] Error:", err);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
