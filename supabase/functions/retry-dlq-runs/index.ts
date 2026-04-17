// Edge function : retry-dlq-runs
// Worker périodique (cron 5 min) qui rejoue les runs en attente dans hq.runs_dlq.
// Backoff exponentiel : 1min → 5min → 30min → abandon après 3 essais (géré par mark_dlq_attempt).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_PER_RUN = 10; // limite par exécution worker

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

    // Auth : header X-Cron-Secret
    const cronHeader = req.headers.get("X-Cron-Secret");
    if (CRON_SECRET && cronHeader !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch dus (UPDATE → in_progress + RETURNING via RPC)
    const { data: pending, error: fetchErr } = await admin.rpc("get_dlq_pending", {
      limit_count: MAX_PER_RUN,
    });

    if (fetchErr) {
      console.error("[retry-dlq-runs] fetch error:", fetchErr.message);
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const items = (pending as Array<{
      id: string;
      original_run_id: string;
      run_type: string;
      platform_key: string | null;
      payload: Record<string, unknown>;
      attempts: number;
      max_attempts: number;
    }>) || [];

    const results: Array<{ id: string; outcome: string; error?: string }> = [];

    for (const item of items) {
      try {
        // Rejouer via executive-run avec le run_type d'origine
        const resp = await fetch(`${SUPABASE_URL}/functions/v1/executive-run`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            "X-DLQ-Retry": item.id,
          },
          body: JSON.stringify({
            run_type: item.run_type,
            platform_key: item.platform_key,
            owner_requested: false,
            payload: item.payload,
          }),
        });

        if (resp.ok) {
          await resp.text(); // consume body
          await admin.rpc("mark_dlq_attempt", {
            p_dlq_id: item.id,
            p_outcome: "recovered",
          });
          results.push({ id: item.id, outcome: "recovered" });
        } else {
          const errText = await resp.text().catch(() => `HTTP ${resp.status}`);
          await admin.rpc("mark_dlq_attempt", {
            p_dlq_id: item.id,
            p_outcome: "failed",
            p_error: errText.slice(0, 500),
          });
          results.push({ id: item.id, outcome: "failed", error: errText.slice(0, 200) });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await admin.rpc("mark_dlq_attempt", {
          p_dlq_id: item.id,
          p_outcome: "failed",
          p_error: msg.slice(0, 500),
        });
        results.push({ id: item.id, outcome: "failed", error: msg });
      }
    }

    // Log structuré
    await admin.rpc("insert_hq_log", {
      p_level: "info",
      p_source: "dlq-worker",
      p_message: "dlq.batch_processed",
      p_metadata: {
        processed: items.length,
        recovered: results.filter((r) => r.outcome === "recovered").length,
        failed: results.filter((r) => r.outcome === "failed").length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: items.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[retry-dlq-runs] Error:", err);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
