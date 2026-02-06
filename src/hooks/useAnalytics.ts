import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Generate a simple anonymous session ID (persisted in sessionStorage)
function getSessionId(): string {
  const key = "ec_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

type EventType = "page_view" | "cta_click" | "signup" | "activation" | "conversion";

interface TrackEventParams {
  eventType: EventType;
  eventName?: string;
  eventData?: Record<string, unknown>;
  pagePath?: string;
}

/**
 * Lightweight internal analytics hook.
 * - Automatically tracks page views on route changes.
 * - Exposes `trackEvent` for CTA clicks and conversions.
 */
export function useAnalytics() {
  const location = useLocation();
  const lastTrackedPath = useRef<string>("");

  const trackEvent = useCallback(async ({ eventType, eventName, eventData, pagePath }: TrackEventParams) => {
    try {
      await supabase.from("analytics_events").insert([{
        event_type: eventType,
        page_path: pagePath ?? location.pathname,
        event_name: eventName ?? null,
        event_data: (eventData ?? {}) as Json,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
      }]);
    } catch {
      // Silently fail — analytics should never break the app
    }
  }, [location.pathname]);

  // Auto-track page views on route change
  useEffect(() => {
    if (location.pathname !== lastTrackedPath.current) {
      lastTrackedPath.current = location.pathname;
      trackEvent({ eventType: "page_view" });
    }
  }, [location.pathname, trackEvent]);

  return { trackEvent };
}
