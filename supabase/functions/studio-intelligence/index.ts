/**
 * EmotionSphere Studio — strategic intelligence edge function.
 *
 * Wraps multiple AI-powered actions used by the Studio module:
 *   - analyze_opportunity        (description → problem / opportunity / risks)
 *   - analyze_call               (call text → criteria, deadlines, angle)
 *   - generate_blueprint_360     (opportunity/call → 12-section blueprint JSON)
 *   - recommend_equity_deal      (blueprint → deal recommendation)
 *   - generate_pitch             (blueprint → pitch variants)
 *   - generate_legal_checklist   (deal/blueprint → contractual documents)
 *
 * All actions are owner-only and rate-limited.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { authErrorResponse, isAuthError, validateAuth } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

type Action =
  | "analyze_opportunity"
  | "analyze_call"
  | "generate_blueprint_360"
  | "recommend_equity_deal"
  | "generate_pitch"
  | "generate_legal_checklist";

interface BaseRequest {
  action: Action;
  payload?: Record<string, unknown>;
}

const SYSTEM_BASE = `Tu es l'architecte stratégique d'EmotionSphere Studio, branche stratégique d'EMOTIONSCARE SASU.
Tu ne donnes pas des idées : tu transformes des problèmes complexes en projets activables, finançables et stratégiquement différenciants.
Tes livrables sont sobres, structurés et exploitables. Tu réponds en français, dans le format JSON demandé.
Tu signales toujours quand une décision juridique ou capitalistique doit être validée par un avocat ou expert-comptable.`;

const ACTION_INSTRUCTIONS: Record<Action, string> = {
  analyze_opportunity: `Analyse l'opportunité fournie et renvoie un JSON STRICT :
{
  "problem": string,
  "opportunity": string,
  "domains": string[],
  "potential": "low" | "medium" | "high" | "exceptional",
  "risks": string[],
  "recommended_action": string,
  "execution_risk_score": number (0-100),
  "strategic_value_score": number (0-100)
}`,
  analyze_call: `Analyse le texte ou la description d'un appel à projets / appel d'offres / AMI.
Renvoie un JSON STRICT :
{
  "criteria": string[],
  "deadline_hint": string | null,
  "expected_deliverables": string[],
  "required_partners": string[],
  "risks": string[],
  "winning_angle": string,
  "feasibility": "low" | "medium" | "high",
  "recommended_solution": string,
  "fit_with_emotionsphere": "low" | "medium" | "high",
  "should_apply": boolean
}`,
  generate_blueprint_360: `À partir du contexte fourni (opportunité ou appel à projets), produis un Blueprint 360° structuré.
Renvoie un JSON STRICT avec les clés suivantes :
{
  "title": string,
  "problem": { "summary": string, "bullets": string[] },
  "opportunity": { "summary": string, "bullets": string[] },
  "solution": { "summary": string, "bullets": string[] },
  "targets": { "summary": string, "bullets": string[] },
  "business_model": { "summary": string, "bullets": string[] },
  "partners": { "summary": string, "bullets": string[] },
  "deployment_plan": { "summary": string, "bullets": string[] },
  "kpis": { "summary": string, "bullets": string[] },
  "risks": { "summary": string, "bullets": string[] },
  "pitch": { "short": string, "long": string, "institutional": string },
  "emotionsphere_role": { "summary": string, "bullets": string[] },
  "deal_recommendation": { "summary": string, "bullets": string[] }
}`,
  recommend_equity_deal: `À partir d'un Blueprint et du niveau d'implication d'EmotionSphere, recommande une structure de deal.
Renvoie un JSON STRICT :
{
  "recommended_deal_type": "equity_only" | "flat_plus_equity" | "success_fee_plus_equity" | "advisory_monthly" | "bsa_advisor" | "direct_participation" | "industry_contribution" | "hybrid",
  "equity_min": number,
  "equity_max": number,
  "equity_recommended": number,
  "rationale": string[],
  "conditions": string[],
  "documents_required": string[]
}`,
  generate_pitch: `À partir d'un Blueprint, produis 4 pitchs.
Renvoie un JSON STRICT :
{
  "pitch_30s": string,
  "pitch_2min": string,
  "pitch_institutional": string,
  "pitch_investor": string
}`,
  generate_legal_checklist: `Produis une checklist juridique adaptée au contexte (deal / blueprint).
Renvoie un JSON STRICT :
{
  "items": [
    { "title": string, "description": string, "importance": "obligatoire" | "fortement_recommande" | "selon_contexte" }
  ],
  "disclaimer": string
}`,
};

function bad(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return bad(405, "Méthode non autorisée");
  }

  try {
    const auth = await validateAuth(req, "owner");
    if (isAuthError(auth)) return authErrorResponse(auth, corsHeaders);

    const userId = auth.userId;

    // 30 requests per 5 minutes per user — keeps AI cost predictable.
    const rl = checkRateLimit(`studio-intelligence:${userId}`, {
      maxRequests: 30,
      windowMs: 5 * 60 * 1000,
    });
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[studio-intelligence] LOVABLE_API_KEY missing");
      return bad(500, "Service IA non configuré");
    }

    let body: BaseRequest;
    try {
      body = (await req.json()) as BaseRequest;
    } catch {
      return bad(400, "Payload JSON invalide");
    }

    if (!body || typeof body.action !== "string") {
      return bad(400, "Champ `action` requis");
    }

    if (!Object.prototype.hasOwnProperty.call(ACTION_INSTRUCTIONS, body.action)) {
      return bad(400, `Action inconnue : ${body.action}`);
    }

    const payload = body.payload ?? {};
    const payloadString = JSON.stringify(payload).slice(0, 32_000);
    const instructions = ACTION_INSTRUCTIONS[body.action as Action];

    const messages = [
      { role: "system", content: SYSTEM_BASE },
      { role: "system", content: instructions },
      {
        role: "user",
        content: `Contexte (JSON):\n${payloadString}\n\nRéponds STRICTEMENT avec un objet JSON valide, sans texte autour.`,
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return bad(429, "Limite IA atteinte. Réessayez dans quelques instants.");
      if (response.status === 402) return bad(402, "Crédits IA insuffisants.");
      const t = await response.text();
      console.error("[studio-intelligence] AI gateway error", response.status, t.slice(0, 500));
      return bad(500, "Service IA temporairement indisponible");
    }

    const json = await response.json();
    const raw = json?.choices?.[0]?.message?.content ?? "";
    let parsed: unknown = null;
    try {
      const cleaned = String(raw).trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "");
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.warn("[studio-intelligence] failed to parse model output", err);
      parsed = { raw };
    }

    return new Response(
      JSON.stringify({ action: body.action, result: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[studio-intelligence] error:", e);
    return bad(500, "Service temporairement indisponible");
  }
});
