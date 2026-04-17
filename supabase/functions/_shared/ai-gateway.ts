// Wrapper Lovable AI Gateway avec circuit-breaker intégré.
import {
  assertCanCall,
  recordFailure,
  recordSuccess,
  BreakerOpenError,
  getBreakerSnapshot,
  type BreakerState,
} from "./circuit-breaker.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const BREAKER_KEY = "ai-gateway:lovable";

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIGatewayCallOptions {
  apiKey: string;
  model: string;
  messages: AIChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIGatewayResult {
  content: string;
  model: string;
  fallback_used: boolean;
  breaker_state: BreakerState;
  raw?: unknown;
}

/**
 * Appelle le Lovable AI Gateway protégé par un circuit-breaker.
 *
 * - Si le breaker est OPEN, lève une `BreakerOpenError` immédiatement (pas d'appel réseau).
 * - Sur succès, le breaker est réinitialisé.
 * - Sur erreur 5xx ou réseau, un échec est compté ; après 3 échecs en 2 min → OPEN 60s.
 * - Les erreurs 4xx (sauf 429) ne comptent PAS comme défaillance gateway (faute appelant).
 */
export async function callAIGateway(opts: AIGatewayCallOptions): Promise<AIGatewayResult> {
  assertCanCall(BREAKER_KEY);

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 3000,
      }),
    });
  } catch (networkErr) {
    recordFailure(BREAKER_KEY);
    throw networkErr;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    // 5xx, 429 et erreurs réseau comptent comme défaillance gateway
    if (response.status >= 500 || response.status === 429) {
      recordFailure(BREAKER_KEY);
    }
    const err = new Error(`AI Gateway error ${response.status}: ${text.slice(0, 200)}`);
    (err as Error & { status?: number }).status = response.status;
    throw err;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  recordSuccess(BREAKER_KEY);

  return {
    content,
    model: opts.model,
    fallback_used: false,
    breaker_state: "CLOSED",
    raw: data,
  };
}

/**
 * Tentative gracieuse : appelle le gateway, retourne un fallback si breaker OPEN.
 * Utilisé pour ne pas bloquer totalement le système quand le LLM est indisponible.
 */
export async function callAIGatewayOrFallback(
  opts: AIGatewayCallOptions,
  fallbackContent: string
): Promise<AIGatewayResult> {
  try {
    return await callAIGateway(opts);
  } catch (err) {
    if (err instanceof BreakerOpenError) {
      const snap = getBreakerSnapshot(BREAKER_KEY);
      return {
        content: fallbackContent,
        model: "fallback",
        fallback_used: true,
        breaker_state: snap.state as BreakerState,
      };
    }
    throw err;
  }
}

export { BreakerOpenError, getBreakerSnapshot };
