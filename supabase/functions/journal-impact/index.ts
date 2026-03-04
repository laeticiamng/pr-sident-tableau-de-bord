import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isOwner } = await supabaseUser.rpc("is_owner");
    if (!isOwner) {
      return new Response(JSON.stringify({ error: "Accès réservé" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { entry_id, entry_title, entry_content, entry_type, entry_date, entry_tags } = await req.json();

    if (!entry_id || !entry_title || !entry_date) {
      return new Response(JSON.stringify({ error: "Paramètres manquants" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // ── Gather KPI data before & after the decision date ──────────────

    const decisionDate = new Date(entry_date);
    const daysBefore = 14;
    const daysAfter = Math.min(
      14,
      Math.floor((Date.now() - decisionDate.getTime()) / 86400000)
    );

    // 1. Stripe KPIs (current snapshot)
    let stripeData: any = null;
    try {
      const stripeResp = await fetch(`${supabaseUrl}/functions/v1/stripe-kpis`, {
        headers: { Authorization: `Bearer ${serviceKey}` },
      });
      if (stripeResp.ok) stripeData = await stripeResp.json();
    } catch { /* skip */ }

    // 2. Platform health
    let platforms: any[] = [];
    try {
      const { data } = await supabaseAdmin.rpc("get_all_hq_platforms");
      platforms = data || [];
    } catch { /* skip */ }

    // 3. Runs around the decision date (context)
    let runsAround: any[] = [];
    try {
      const { data } = await supabaseAdmin.rpc("get_hq_recent_runs", { limit_count: 50 });
      runsAround = (data || []).filter((r: any) => {
        const runDate = new Date(r.created_at);
        const diffDays = (runDate.getTime() - decisionDate.getTime()) / 86400000;
        return diffDays >= -daysBefore && diffDays <= daysAfter;
      });
    } catch { /* skip */ }

    // 4. Other journal entries around the same period
    let nearbyEntries: any[] = [];
    try {
      const { data } = await supabaseAdmin.rpc("get_hq_journal_entries", { limit_count: 50 });
      nearbyEntries = (data || []).filter((e: any) => {
        if (e.id === entry_id) return false;
        const entryDate = new Date(e.created_at);
        const diffDays = (entryDate.getTime() - decisionDate.getTime()) / 86400000;
        return diffDays >= -daysBefore && diffDays <= daysAfter;
      });
    } catch { /* skip */ }

    // ── Build AI prompt ───────────────────────────────────────────────

    const contextData = {
      decision: {
        title: entry_title,
        content: entry_content || "(pas de détails)",
        type: entry_type || "decision",
        date: entry_date,
        tags: entry_tags || [],
      },
      analysis_window: {
        before: `${daysBefore} jours avant`,
        after: daysAfter > 0 ? `${daysAfter} jours après` : "décision trop récente pour mesurer l'impact",
      },
      current_kpis: stripeData?.kpis
        ? {
            mrr: stripeData.kpis.mrr,
            mrr_change: stripeData.kpis.mrrChange,
            total_customers: stripeData.kpis.totalCustomers,
            churn_rate: stripeData.kpis.churnRate,
            arpu: stripeData.kpis.arpu,
          }
        : "Données Stripe non disponibles",
      platforms: platforms.map((p: any) => ({
        name: p.name,
        status: p.status,
        uptime: p.uptime_percent,
      })),
      runs_around_decision: runsAround.map((r: any) => ({
        type: r.run_type,
        status: r.status,
        date: r.created_at,
        summary: r.executive_summary?.substring(0, 200),
      })),
      nearby_journal_entries: nearbyEntries.map((e: any) => ({
        title: e.title,
        type: e.entry_type,
        date: e.created_at,
        has_impact: !!e.impact_measured,
      })),
    };

    const systemPrompt = `Tu es l'analyste stratégique en chef d'EMOTIONSCARE SASU, un éditeur de logiciels SaaS français.

Ta mission : analyser l'IMPACT RÉEL d'une décision présidentielle en comparant les KPIs et l'état du système avant et après la date de la décision.

RÈGLES STRICTES :
- Base ton analyse UNIQUEMENT sur les données fournies. Ne fabrique AUCUN chiffre.
- Si les données sont insuffisantes pour mesurer l'impact, dis-le clairement.
- Si la décision est trop récente (< 7 jours), indique qu'il est prématuré de conclure.
- Structure ta réponse avec des sections claires.
- Sois direct, concis, et actionnable — style conseil d'administration.
- Utilise des émojis pour la lisibilité (📈 📉 ✅ ⚠️ etc.)

FORMAT DE RÉPONSE (texte court, pas de markdown lourd) :

📊 SYNTHÈSE D'IMPACT
[1-2 phrases résumant l'impact global]

📈 INDICATEURS CLÉS
[Liste des KPIs pertinents avec évolution constatée ou "données insuffisantes"]

🔍 ANALYSE CAUSALE
[Lien entre la décision et les changements observés, avec nuance sur les facteurs confondants]

⚡ RECOMMANDATION
[1 action concrète suggérée pour maximiser/corriger l'impact]

🎯 SCORE DE CONFIANCE
[Faible / Moyen / Élevé — basé sur la quantité de données disponibles]`;

    const userPrompt = `Analyse l'impact de cette décision présidentielle :

${JSON.stringify(contextData, null, 2)}`;

    // ── Call Lovable AI ───────────────────────────────────────────────

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY non configurée" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes IA atteinte, réessayez dans quelques minutes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResp.text();
      console.error("AI error:", aiResp.status, errText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const analysis = aiData.choices?.[0]?.message?.content || "Analyse non disponible.";

    // ── Save the impact analysis to the journal entry ─────────────────

    await supabaseAdmin.rpc("update_hq_journal_entry" as any, {
      p_id: entry_id,
      p_impact_measured: {
        summary: analysis,
        date: new Date().toISOString(),
        ai_generated: true,
        data_sources: [
          stripeData ? "stripe" : null,
          platforms.length > 0 ? "platforms" : null,
          runsAround.length > 0 ? "runs" : null,
        ].filter(Boolean),
        analysis_window_days: { before: daysBefore, after: daysAfter },
      },
    });

    // Log
    await supabaseAdmin.rpc("insert_hq_log", {
      p_level: "info",
      p_source: "journal-impact",
      p_message: `Impact IA analysé pour: ${entry_title}`,
      p_metadata: {
        entry_id,
        data_sources_count: [stripeData, platforms.length, runsAround.length].filter(Boolean).length,
      },
    });

    return new Response(
      JSON.stringify({ analysis, entry_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Journal impact error:", error);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
