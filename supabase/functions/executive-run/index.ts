// Edge function : /executive-run
// Horizon 3 — Refactor Axe 4 : orchestration pure (~200 lignes)
// Modules extraits : _shared/run-templates.ts, run-data-fetchers.ts, run-persistence.ts
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { getRunCostEstimate } from "../_shared/run-cost-estimates.ts";
import { callAIGatewayOrFallback, getBreakerSnapshot } from "../_shared/ai-gateway.ts";
import { RUN_TEMPLATES, MODEL_CONFIG } from "../_shared/run-templates.ts";
import { fetchGitHubData, fetchPerplexityData, buildPerplexityQuery } from "../_shared/run-data-fetchers.ts";
import { persistRun, logRunEvent, enqueueDLQRun } from "../_shared/run-persistence.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.error("[Executive Run] Missing required env vars");
      return jsonResponse({ error: "Service temporarily unavailable" }, 503);
    }

    // === AUTH ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authorization requise" }, 401);
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "Token invalide ou expiré" }, 401);
    }
    const userId = claimsData.claims.sub;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId, _role: "owner",
    });
    if (roleError) return jsonResponse({ error: "Erreur de vérification des permissions" }, 500);
    if (!hasOwnerRole) return jsonResponse({ error: "Permissions insuffisantes - rôle owner requis" }, 403);

    // === RATE LIMIT ===
    const rl = checkRateLimit(`executive-run:${userId}`, { maxRequests: 30, windowMs: 5 * 60 * 1000 });
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    // === PARSE INPUT ===
    const { run_type, platform_key, context_data } = await req.json();
    const template = RUN_TEMPLATES[run_type];
    if (!template) {
      await logRunEvent(supabaseAdmin, "warn", `Unknown run type attempted: ${run_type}`, {
        run_type, platform_key, user_id: userId,
      });
      return jsonResponse({ error: `Unknown run type: ${run_type}` }, 400);
    }

    const model = MODEL_CONFIG[template.model];
    const startTime = Date.now();
    const costEstimate = getRunCostEstimate(run_type);

    await logRunEvent(supabaseAdmin, "info", "run.started", {
      run_type, platform_key, model, user_id: userId, cost_estimate: costEstimate,
    });

    // === BUILD CONTEXT ===
    let additionalContext = "";
    if (template.useGitHub) additionalContext += await fetchGitHubData(GITHUB_TOKEN, platform_key);

    if (platform_key) {
      const { data: platform } = await supabaseAdmin.rpc("get_hq_platform", { platform_key_param: platform_key });
      if (platform) {
        additionalContext += `\n\n📋 DONNÉES PLATEFORME:\nNom: ${platform.name || platform_key}\nStatut: ${platform.status?.toUpperCase() || "INCONNU"}\nUptime: ${platform.uptime_percent || "N/A"}%`;
      }
    }

    if (run_type === "DAILY_EXECUTIVE_BRIEF") {
      const { data: platforms } = await supabaseAdmin.rpc("get_all_hq_platforms");
      if (Array.isArray(platforms)) {
        additionalContext += `\n\n📋 STATUT BASE DE DONNÉES:\n`;
        platforms.forEach((p: { name: string; status?: string; status_reason?: string; uptime_percent?: number }) => {
          additionalContext += `- ${p.name}: ${p.status?.toUpperCase() || "INCONNU"} (${p.status_reason || "-"}) - Uptime: ${p.uptime_percent || "N/A"}%\n`;
        });
      }
    }

    if (template.usePerplexity) {
      additionalContext += await fetchPerplexityData(PERPLEXITY_API_KEY, buildPerplexityQuery(run_type));
    }

    if (context_data) {
      additionalContext += `\n\nContexte supplémentaire:\n${JSON.stringify(context_data, null, 2)}`;
    }

    const userPrompt = `📅 Date: ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}

🏢 Entreprise: EMOTIONSCARE SASU — Éditeur de logiciels applicatifs
📍 Siège: Amiens, France
💼 7 Plateformes managées: EmotionsCare, NEARVITY, System Compass, Growth Copilot, Med MNG, UrgenceOS, Track Triumph

Type de run: ${run_type}
${additionalContext}

Génère le rapport demandé en français avec les données RÉELLES fournies ci-dessus.`;

    // === CALL AI ===
    const fallbackMessage = `⚠️ **Service IA temporairement indisponible**

Le moteur d'IA exécutif est en mode dégradé suite à des défaillances répétées du gateway. Le circuit-breaker est actif pour préserver la stabilité du système.

**Run demandé** : ${run_type}${platform_key ? `\n**Plateforme** : ${platform_key}` : ""}
**Action recommandée** : Réessayez dans 1 à 2 minutes. Si le problème persiste, consultez le panneau Diagnostics.

_Ce message est généré automatiquement par le circuit-breaker, aucune charge IA n'a été facturée._`;

    let aiResult;
    try {
      aiResult = await callAIGatewayOrFallback(
        {
          apiKey: LOVABLE_API_KEY,
          model,
          messages: [
            { role: "system", content: template.systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          maxTokens: 3000,
        },
        fallbackMessage
      );
    } catch (gatewayErr) {
      const status = (gatewayErr as Error & { status?: number }).status;
      if (status === 429) return jsonResponse({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }, 429);
      if (status === 402) return jsonResponse({ error: "Crédits IA insuffisants. Contactez l'administrateur." }, 402);
      throw gatewayErr;
    }

    const executiveSummary = aiResult.content || "Rapport non généré";
    const breakerSnap = getBreakerSnapshot("ai-gateway:lovable");
    const durationMs = Date.now() - startTime;

    const dataSources = [
      template.useGitHub ? "GitHub API" : null,
      template.usePerplexity ? "Perplexity AI" : null,
      template.useFirecrawl ? "Firecrawl" : null,
      aiResult.fallback_used ? "Fallback (breaker OPEN)" : "Lovable AI Gateway",
    ].filter(Boolean) as string[];

    // === PERSIST ===
    const persistedRunId = await persistRun({
      supabaseAuth, supabaseAdmin,
      runType: run_type,
      platformKey: platform_key || null,
      status: aiResult.fallback_used ? "failed" : "completed",
      executiveSummary,
      appendix: {
        model_used: aiResult.model, data_sources: dataSources,
        duration_ms: durationMs,
        cost_estimate: aiResult.fallback_used ? 0 : costEstimate,
        steps: template.steps, fallback_used: aiResult.fallback_used,
        breaker_state: aiResult.breaker_state,
      },
    });

    await logRunEvent(supabaseAdmin, aiResult.fallback_used ? "warn" : "info",
      aiResult.fallback_used ? "run.completed.fallback" : "run.completed",
      {
        run_type, platform_key, model: aiResult.model, duration_ms: durationMs,
        run_id: persistedRunId, cost_estimate: aiResult.fallback_used ? 0 : costEstimate,
        breaker_state: aiResult.breaker_state, breaker_snapshot: breakerSnap,
      });

    // === DLQ (skip si retry pour éviter boucles) ===
    const isDLQRetry = req.headers.get("X-DLQ-Retry") !== null;
    if (aiResult.fallback_used && persistedRunId && !isDLQRetry) {
      await enqueueDLQRun({
        originalRunId: persistedRunId,
        runType: run_type,
        platformKey: platform_key || null,
        payload: { breaker_state: aiResult.breaker_state },
        failureReason: `LLM unavailable (breaker: ${aiResult.breaker_state})`,
      });
    }

    return jsonResponse({
      success: true,
      run_id: persistedRunId || crypto.randomUUID(),
      run_type, platform_key,
      executive_summary: executiveSummary,
      steps: template.steps,
      model_used: aiResult.model,
      fallback_used: aiResult.fallback_used,
      breaker_state: aiResult.breaker_state,
      data_sources: dataSources,
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Executive Run] Unexpected error:", error);
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await adminClient.rpc("insert_hq_log", {
          p_level: "error", p_source: "executive-run", p_message: "run.failed",
          p_metadata: {
            error_message: error instanceof Error ? error.message : String(error),
            error_stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : undefined,
          },
        });
      }
    } catch { /* best-effort */ }

    return jsonResponse({ error: "An unexpected error occurred. Please try again later." }, 500);
  }
});
