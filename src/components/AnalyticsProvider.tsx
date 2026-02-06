import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Invisible component that activates page view tracking.
 * Place inside <BrowserRouter> to access routing context.
 */
export function AnalyticsProvider() {
  useAnalytics();
  return null;
}
