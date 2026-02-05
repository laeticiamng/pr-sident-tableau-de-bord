import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Scheduled Runs - Scheduler pour exécutions automatiques
 * Déclenché par pg_cron pour les tâches planifiées
 */

interface ScheduledJob {
  key: string;
  name: string;
  cronExpression: string;
  runType: string;
  description: string;
  enabled: boolean;
}

// Configuration des jobs planifiés
const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    key: "daily_brief",
    name: "Brief Exécutif Quotidien",
    cronExpression: "0 7 * * 1-5", // 7h du lundi au vendredi
    runType: "DAILY_EXECUTIVE_BRIEF",
    description: "Synthèse quotidienne avec GitHub et veille marché",
    enabled: true,
  },
  {
    key: "weekly_security_audit",
    name: "Audit Sécurité Hebdomadaire",
    cronExpression: "0 8 * * 1", // Lundi 8h
    runType: "SECURITY_AUDIT_RLS",
    description: "Audit complet des politiques RLS",
    enabled: true,
  },
  {
    key: "weekly_marketing_plan",
    name: "Plan Marketing Hebdomadaire",
    cronExpression: "0 9 * * 1", // Lundi 9h
    runType: "MARKETING_WEEK_PLAN",
    description: "Planification marketing avec veille concurrentielle",
    enabled: true,
  },
  {
    key: "daily_platform_review",
    name: "Revue Plateformes Quotidienne",
    cronExpression: "0 18 * * 1-5", // 18h du lundi au vendredi
    runType: "PLATFORM_STATUS_REVIEW",
    description: "Revue de statut de toutes les plateformes",
    enabled: true,
  },
  {
    key: "weekly_competitive_analysis",
    name: "Analyse Concurrentielle Hebdomadaire",
    cronExpression: "0 10 * * 3", // Mercredi 10h
    runType: "COMPETITIVE_ANALYSIS",
    description: "Veille stratégique et analyse des concurrents",
    enabled: true,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Configuration Supabase manquante");
    }

    // Parse request body ONCE and reuse
    const requestBody = await req.json().catch(() => ({}));
    const { action, job_key } = requestBody;

    // Action: cron_trigger - Special case for pg_cron (no auth needed for internal calls)
    // This is triggered by pg_cron internally and MUST be secured by a shared secret
    if (action === "cron_trigger") {
      const cronSecret = req.headers.get("X-Cron-Secret");
      const expectedSecret = Deno.env.get("CRON_SECRET");
      
      // SECURITY: CRON_SECRET is MANDATORY for cron triggers (minimum 32 chars recommended)
      if (!expectedSecret) {
        console.error("[Scheduler] CRON_SECRET not configured - rejecting request");
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // SECURITY: Constant-time comparison to prevent timing attacks
      if (!cronSecret || cronSecret.length !== expectedSecret.length) {
        console.error("[Scheduler] Invalid or missing cron secret");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Constant-time string comparison
      let isValid = true;
      for (let i = 0; i < expectedSecret.length; i++) {
        if (cronSecret[i] !== expectedSecret[i]) {
          isValid = false;
        }
      }
      
      if (!isValid) {
        console.error("[Scheduler] Invalid cron secret provided");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[Scheduler] CRON trigger received - secret validated");
      
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // SECURITY: Rate limiting - Check last cron execution time
      // Prevent rapid repeated triggers (minimum 5 minute cooldown between full runs)
      const COOLDOWN_MINUTES = 5;
      const { data: recentRuns } = await supabaseAdmin.rpc("get_hq_recent_runs", { 
        limit_count: 1 
      });
      
      if (recentRuns && recentRuns.length > 0) {
        const lastRunTime = new Date(recentRuns[0].completed_at || recentRuns[0].created_at);
        const minutesSinceLastRun = (Date.now() - lastRunTime.getTime()) / (1000 * 60);
        
        if (minutesSinceLastRun < COOLDOWN_MINUTES) {
          console.warn(`[Scheduler] Rate limited: last run was ${minutesSinceLastRun.toFixed(1)} minutes ago (cooldown: ${COOLDOWN_MINUTES} min)`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Rate limited",
              retry_after_seconds: Math.ceil((COOLDOWN_MINUTES - minutesSinceLastRun) * 60)
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0 = Dimanche
      
      // Trouver les jobs à exécuter maintenant
      const jobsToRun = SCHEDULED_JOBS.filter(job => {
        if (!job.enabled) return false;
        
        const [, hour, , , dayOfWeek] = job.cronExpression.split(" ");
        const targetHour = parseInt(hour);
        const targetDays = dayOfWeek === "*" ? [0, 1, 2, 3, 4, 5, 6] : 
                          dayOfWeek.includes("-") ? 
                            Array.from(
                              { length: parseInt(dayOfWeek.split("-")[1]) - parseInt(dayOfWeek.split("-")[0]) + 1 },
                              (_, i) => parseInt(dayOfWeek.split("-")[0]) + i
                            ) : [parseInt(dayOfWeek)];
        
        return targetHour === currentHour && targetDays.includes(currentDay);
      });

      console.log(`[Scheduler] Found ${jobsToRun.length} jobs to run`);

      const results = [];
      for (const job of jobsToRun) {
        try {
          // For scheduled runs, we call executive-run with service role key
          const execResponse = await fetch(`${SUPABASE_URL}/functions/v1/executive-run`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              run_type: job.runType,
              context_data: {
                triggered_by: "scheduler",
                job_key: job.key,
                scheduled_time: new Date().toISOString(),
              },
            }),
          });
          
          const result = await execResponse.json();
          
          // Log the run
          if (execResponse.ok) {
            await supabaseAdmin.rpc("insert_hq_run", {
              p_run_type: job.runType,
              p_owner_requested: false,
              p_status: "completed",
              p_executive_summary: result.executive_summary,
              p_detailed_appendix: {
                triggered_by: "scheduler",
                job_key: job.key,
                model_used: result.model_used,
                data_sources: result.data_sources,
              },
            });
          }
          
          results.push({ job: job.key, success: execResponse.ok, result });
        } catch (e) {
          results.push({ job: job.key, success: false, error: (e as Error).message });
        }
      }

      return new Response(
        JSON.stringify({ success: true, executed: results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK (for user-initiated actions)
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Scheduler] Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("[Scheduler] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[Scheduler] Authenticated user: ${userId}`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError || !hasOwnerRole) {
      console.error(`[Scheduler] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Scheduler] User ${userId} authorized as owner`);
    // ============================================
    // END AUTHENTICATION CHECK
    // ============================================

    // Action: list - Retourne la liste des jobs configurés
    if (action === "list") {
      console.log("[Scheduler] Listing configured jobs");
      return new Response(
        JSON.stringify({ 
          success: true, 
          jobs: SCHEDULED_JOBS,
          timezone: "Europe/Paris",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: status - Retourne le statut d'exécution des jobs
    if (action === "status") {
      console.log("[Scheduler] Fetching job execution status");
      
      // Récupérer les derniers runs par type
      const { data: recentRuns } = await supabaseAdmin.rpc("get_hq_recent_runs", { 
        limit_count: 50 
      });

      const jobStatus = SCHEDULED_JOBS.map(job => {
        const lastRun = recentRuns?.find((r: any) => r.run_type === job.runType);
        return {
          ...job,
          lastRun: lastRun ? {
            id: lastRun.id,
            status: lastRun.status,
            completedAt: lastRun.completed_at,
          } : null,
        };
      });

      return new Response(
        JSON.stringify({ success: true, jobs: jobStatus }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: execute - Exécute un job spécifique
    if (action === "execute" && job_key) {
      const job = SCHEDULED_JOBS.find(j => j.key === job_key);
      
      if (!job) {
        return new Response(
          JSON.stringify({ error: `Job non trouvé: ${job_key}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!job.enabled) {
        return new Response(
          JSON.stringify({ error: `Job désactivé: ${job_key}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[Scheduler] Executing job: ${job.name} (${job.runType})`);

      // Appeler l'Edge Function executive-run avec le token utilisateur
      const execResponse = await fetch(`${SUPABASE_URL}/functions/v1/executive-run`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          run_type: job.runType,
          context_data: {
            triggered_by: "manual",
            job_key: job.key,
            scheduled_time: new Date().toISOString(),
          },
        }),
      });

      if (!execResponse.ok) {
        const errorText = await execResponse.text();
        console.error(`[Scheduler] Execution failed: ${errorText}`);
        return new Response(
          JSON.stringify({ error: `Échec d'exécution: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await execResponse.json();

      // Enregistrer le run dans la DB
      const { data: runId } = await supabaseAdmin.rpc("insert_hq_run", {
        p_run_type: job.runType,
        p_owner_requested: true,
        p_status: "completed",
        p_executive_summary: result.executive_summary,
        p_detailed_appendix: {
          triggered_by: "manual",
          job_key: job.key,
          model_used: result.model_used,
          data_sources: result.data_sources,
        },
      });

      console.log(`[Scheduler] Run completed: ${runId}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          job,
          run_id: runId || result.run_id,
          executive_summary: result.executive_summary,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Action invalide" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Scheduler] Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
