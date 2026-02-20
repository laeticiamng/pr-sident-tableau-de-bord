import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * AI Scheduler — Remplace pg_cron par un scheduler intelligent piloté par Lovable AI
 * L'IA décide quels jobs doivent tourner en fonction de l'heure, du contexte et de l'historique.
 * Déclenché par polling depuis le frontend (autopilot activé).
 */

const SCHEDULED_JOBS = [
  {
    key: "daily_brief",
    name: "Brief Exécutif Quotidien",
    runType: "DAILY_EXECUTIVE_BRIEF",
    description: "Synthèse quotidienne avec GitHub et veille marché",
    schedule: { hours: [7], days: [1, 2, 3, 4, 5] }, // Lun-Ven 7h
    priority: "high",
    enabled: true,
  },
  {
    key: "weekly_security_audit",
    name: "Audit Sécurité Hebdomadaire",
    runType: "SECURITY_AUDIT_RLS",
    description: "Audit complet des politiques RLS et vulnérabilités",
    schedule: { hours: [8], days: [1] }, // Lundi 8h
    priority: "high",
    enabled: true,
  },
  {
    key: "weekly_marketing_plan",
    name: "Plan Marketing Hebdomadaire",
    runType: "MARKETING_WEEK_PLAN",
    description: "Planification marketing avec veille concurrentielle",
    schedule: { hours: [9], days: [1] }, // Lundi 9h
    priority: "medium",
    enabled: true,
  },
  {
    key: "daily_platform_review",
    name: "Revue Plateformes Quotidienne",
    runType: "PLATFORM_STATUS_REVIEW",
    description: "Revue de statut de toutes les plateformes",
    schedule: { hours: [18], days: [1, 2, 3, 4, 5] }, // Lun-Ven 18h
    priority: "medium",
    enabled: true,
  },
  {
    key: "weekly_competitive_analysis",
    name: "Analyse Concurrentielle",
    runType: "COMPETITIVE_ANALYSIS",
    description: "Veille stratégique et analyse des concurrents",
    schedule: { hours: [10], days: [3] }, // Mercredi 10h
    priority: "medium",
    enabled: true,
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Configuration manquante");
    }

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
      return new Response(
        JSON.stringify({ error: "Token invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: hasOwnerRole } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (!hasOwnerRole) {
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, job_key } = body;

    // ── ACTION: status ────────────────────────────────────────────────
    if (action === "status") {
      const { data: recentRuns } = await supabaseAdmin.rpc("get_hq_recent_runs", { limit_count: 50 });

      const now = new Date();
      const parisOffset = 1; // UTC+1 (hiver), à adapter pour l'heure d'été si nécessaire
      const parisHour = (now.getUTCHours() + parisOffset + 24) % 24;
      const parisDay = now.getDay(); // 0=Dim

      const jobsWithStatus = SCHEDULED_JOBS.map(job => {
        const lastRun = recentRuns?.find((r: any) => r.run_type === job.runType);
        const isDueNow = job.enabled &&
          job.schedule.hours.includes(parisHour) &&
          job.schedule.days.includes(parisDay);

        // Check if already run today
        const alreadyRunToday = lastRun ? (() => {
          const lastRunDate = new Date(lastRun.completed_at || lastRun.created_at);
          return lastRunDate.toDateString() === now.toDateString() &&
            (job.runType !== "DAILY_EXECUTIVE_BRIEF" || lastRunDate.toDateString() === now.toDateString());
        })() : false;

        return {
          ...job,
          cronExpression: buildCronExpression(job.schedule),
          isDueNow: isDueNow && !alreadyRunToday,
          lastRun: lastRun ? {
            id: lastRun.id,
            status: lastRun.status,
            completedAt: lastRun.completed_at,
          } : null,
        };
      });

      return new Response(
        JSON.stringify({ success: true, jobs: jobsWithStatus, timezone: "Europe/Paris" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: ai_decide ─────────────────────────────────────────────
    // L'IA analyse le contexte et décide intelligemment quels jobs lancer
    if (action === "ai_decide") {
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Service IA indisponible" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const now = new Date();
      const parisOffset = 1;
      const parisHour = (now.getUTCHours() + parisOffset + 24) % 24;
      const parisDay = now.getDay();
      const parisDate = new Date(now.getTime() + parisOffset * 3600000);

      const { data: recentRuns } = await supabaseAdmin.rpc("get_hq_recent_runs", { limit_count: 20 });

      // Construire le contexte pour l'IA
      const jobsContext = SCHEDULED_JOBS.map(job => {
        const lastRun = recentRuns?.find((r: any) => r.run_type === job.runType);
        const lastRunInfo = lastRun
          ? `Dernier run: ${new Date(lastRun.completed_at || lastRun.created_at).toLocaleString("fr-FR")} (${lastRun.status})`
          : "Jamais exécuté";
        return `- ${job.name} [${job.key}]: planifié ${buildHumanSchedule(job.schedule)} — ${lastRunInfo}`;
      }).join("\n");

      const prompt = `Tu es le planificateur IA d'EMOTIONSCARE HQ. 
Heure actuelle (Paris): ${parisDate.toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
Jour (0=Dim, 1=Lun...6=Sam): ${parisDay}
Heure: ${parisHour}h

Jobs configurés et leur historique:
${jobsContext}

Ta mission: Identifie les jobs qui DOIVENT être exécutés maintenant (correspondance horaire ET pas encore exécutés aujourd'hui/cette semaine selon leur fréquence).
Réponds UNIQUEMENT en JSON valide, sans markdown:
{
  "jobs_to_run": ["job_key1", "job_key2"],
  "reasoning": "Explication courte",
  "next_check_in_minutes": 60
}`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 300,
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) {
          return new Response(
            JSON.stringify({ error: "Limite IA atteinte. Réessayez dans quelques instants." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ error: "Crédits IA insuffisants." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error(`AI Gateway error: ${status}`);
      }

      const aiData = await aiResponse.json();
      const rawContent = aiData.choices?.[0]?.message?.content || "{}";

      let decision: { jobs_to_run: string[]; reasoning: string; next_check_in_minutes: number };
      try {
        const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        decision = JSON.parse(cleaned);
      } catch {
        decision = { jobs_to_run: [], reasoning: "Parsing error", next_check_in_minutes: 60 };
      }

      console.log(`[AI Scheduler] Decision: ${JSON.stringify(decision)}`);

      // Exécuter les jobs décidés par l'IA
      const executionResults = [];
      for (const jobKey of (decision.jobs_to_run || [])) {
        const job = SCHEDULED_JOBS.find(j => j.key === jobKey);
        if (!job?.enabled) continue;

        try {
          const execResponse = await fetch(`${SUPABASE_URL}/functions/v1/executive-run`, {
            method: "POST",
            headers: {
              "Authorization": authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              run_type: job.runType,
              context_data: {
                triggered_by: "ai_scheduler",
                job_key: job.key,
                ai_reasoning: decision.reasoning,
              },
            }),
          });

          if (execResponse.ok) {
            const result = await execResponse.json();
            executionResults.push({ job: job.key, success: true, summary: result.executive_summary?.slice(0, 200) });
          } else {
            executionResults.push({ job: job.key, success: false, error: `HTTP ${execResponse.status}` });
          }
        } catch (e) {
          executionResults.push({ job: job.key, success: false, error: (e as Error).message });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          ai_decision: decision,
          executed: executionResults,
          checked_at: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: execute (manuel) ──────────────────────────────────────
    if (action === "execute" && job_key) {
      const job = SCHEDULED_JOBS.find(j => j.key === job_key);
      if (!job) {
        return new Response(
          JSON.stringify({ error: `Job non trouvé: ${job_key}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const execResponse = await fetch(`${SUPABASE_URL}/functions/v1/executive-run`, {
        method: "POST",
        headers: { "Authorization": authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          run_type: job.runType,
          context_data: { triggered_by: "manual", job_key: job.key },
        }),
      });

      if (!execResponse.ok) {
        const errorText = await execResponse.text();
        return new Response(
          JSON.stringify({ error: `Échec: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await execResponse.json();
      return new Response(
        JSON.stringify({ success: true, job, executive_summary: result.executive_summary }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Action invalide" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AI Scheduler] Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildCronExpression(schedule: { hours: number[]; days: number[] }): string {
  const hours = schedule.hours.join(",");
  const days = schedule.days.length === 7 ? "*" : schedule.days.join(",");
  return `0 ${hours} * * ${days}`;
}

function buildHumanSchedule(schedule: { hours: number[]; days: number[] }): string {
  const dayNames: Record<number, string> = { 0: "Dim", 1: "Lun", 2: "Mar", 3: "Mer", 4: "Jeu", 5: "Ven", 6: "Sam" };
  const days = schedule.days.map(d => dayNames[d]).join(", ");
  return `${days} à ${schedule.hours.join("h, ")}h`;
}
