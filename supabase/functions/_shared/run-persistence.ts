// Persistance des runs exécutifs (logs + insertion + DLQ)
// Extrait de executive-run/index.ts (Horizon 3 — Axe 4)
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface PersistRunInput {
  supabaseAuth: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  runType: string;
  platformKey: string | null;
  status: "completed" | "failed";
  executiveSummary: string;
  appendix: Record<string, unknown>;
}

export async function persistRun(input: PersistRunInput): Promise<string | null> {
  const { supabaseAuth, runType, platformKey, status, executiveSummary, appendix } = input;
  const { data, error } = await supabaseAuth.rpc("insert_hq_run", {
    p_run_type: runType,
    p_platform_key: platformKey,
    p_owner_requested: true,
    p_status: status,
    p_executive_summary: executiveSummary.substring(0, 10000),
    p_detailed_appendix: appendix,
  });
  if (error) {
    console.error("[run-persistence] insert_hq_run error:", error.message);
    return null;
  }
  return data as string;
}

export async function logRunEvent(
  supabaseAdmin: SupabaseClient,
  level: "info" | "warn" | "error",
  message: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.rpc("insert_hq_log", {
      p_level: level,
      p_source: "executive-run",
      p_message: message,
      p_metadata: metadata,
    });
    if (error) console.error("[run-persistence] log error:", error.message);
  } catch (e) {
    console.error("[run-persistence] log exception:", e);
  }
}

export async function enqueueDLQRun(params: {
  originalRunId: string;
  runType: string;
  platformKey: string | null;
  payload: Record<string, unknown>;
  failureReason: string;
}): Promise<void> {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SVC_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SVC_KEY) return;

    const dlqAdmin = createClient(SUPABASE_URL, SVC_KEY);
    await dlqAdmin.rpc("enqueue_dlq_run", {
      p_original_run_id: params.originalRunId,
      p_run_type: params.runType,
      p_platform_key: params.platformKey,
      p_payload: params.payload,
      p_failure_reason: params.failureReason,
    });
  } catch (dlqErr) {
    console.error("[run-persistence] DLQ enqueue failed (non-blocking):", dlqErr);
  }
}
