import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * check-push-triggers
 * Called periodically (or after events) to detect conditions that warrant push notifications:
 * 1. Run failures (status = 'failed')
 * 2. Platforms in red (status = 'red' or 'down')
 * 3. Pending decisions older than 24h
 */
// Constant-time comparison to prevent timing attacks on CRON_SECRET
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: must be called by pg_cron with X-Cron-Secret OR by an authenticated owner
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret") ?? "";
  const isCron = !!cronSecret && timingSafeEqual(providedSecret, cronSecret);

  if (!isCron) {
    // Fallback: require valid Owner JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isOwner } = await userClient.rpc("is_owner");
    if (!isOwner) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const notifications: Array<{ title: string; message: string; urgency: string; type: string; url: string }> = [];

    // 1. Check for failed runs in last hour
    const { data: failedRuns } = await supabaseAdmin.rpc("get_hq_recent_runs", { limit_count: 20 });
    const recentFailures = (failedRuns || []).filter((r: any) => {
      if (r.status !== "failed") return false;
      const age = Date.now() - new Date(r.completed_at || r.created_at).getTime();
      return age < 3600_000; // Last hour
    });

    for (const run of recentFailures) {
      notifications.push({
        title: "🔴 Run IA échoué",
        message: `${run.run_type?.replace(/_/g, " ")} a échoué${run.platform_key ? ` (${run.platform_key})` : ""}`,
        urgency: "high",
        type: "run_failed",
        url: "/hq/historique",
      });
    }

    // 2. Check platforms in red
    const { data: platforms } = await supabaseAdmin.rpc("get_all_hq_platforms");
    const redPlatforms = (platforms || []).filter((p: any) =>
      ["red", "down", "critical"].includes(p.status?.toLowerCase())
    );

    for (const platform of redPlatforms) {
      notifications.push({
        title: "⛔ Plateforme en panne",
        message: `${platform.name} est en statut ${platform.status}${platform.status_reason ? `: ${platform.status_reason}` : ""}`,
        urgency: "critical",
        type: "platform_down",
        url: "/hq/plateformes",
      });
    }

    // 3. Check pending approvals older than 24h
    const { data: pendingActions } = await supabaseAdmin.rpc("get_hq_pending_actions");
    const staleActions = (pendingActions || []).filter((a: any) => {
      const age = Date.now() - new Date(a.created_at).getTime();
      return age > 86400_000; // 24 hours
    });

    if (staleActions.length > 0) {
      notifications.push({
        title: "⏰ Décisions en attente",
        message: `${staleActions.length} action${staleActions.length > 1 ? "s" : ""} attend${staleActions.length > 1 ? "ent" : ""} votre approbation depuis +24h`,
        urgency: "high",
        type: "stale_approval",
        url: "/hq/approbations",
      });
    }

    // Send all notifications
    let sent = 0;
    for (const notif of notifications) {
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-key": serviceKey,
          },
          body: JSON.stringify(notif),
        });
        if (resp.ok) sent++;
      } catch (e) {
        console.error("Failed to send push:", e);
      }
    }

    // Log check
    await supabaseAdmin.rpc("insert_hq_log", {
      p_level: notifications.length > 0 ? "warn" : "info",
      p_source: "push-triggers",
      p_message: `Push trigger check: ${notifications.length} alerts, ${sent} sent`,
      p_metadata: {
        failed_runs: recentFailures.length,
        red_platforms: redPlatforms.length,
        stale_approvals: staleActions.length,
      },
    });

    return new Response(
      JSON.stringify({
        checked: true,
        alerts: notifications.length,
        sent,
        details: {
          failed_runs: recentFailures.length,
          red_platforms: redPlatforms.length,
          stale_approvals: staleActions.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Check push triggers error:", error);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
