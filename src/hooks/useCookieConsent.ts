import { useState, useCallback, useEffect } from "react";

export interface CookieConsent {
  essential: boolean; // always true
  analytics: boolean;
}

const STORAGE_KEY = "ec_cookie_consent";

function readConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.essential !== "boolean") return null;
    return parsed as CookieConsent;
  } catch {
    return null;
  }
}

export function useCookieConsent() {
  const [consent, setConsentState] = useState<CookieConsent | null>(() => readConsent());
  const [showBanner, setShowBanner] = useState(() => readConsent() === null);

  const saveConsent = useCallback((c: CookieConsent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setConsentState(c);
    setShowBanner(false);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({ essential: true, analytics: true });
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent({ essential: true, analytics: false });
  }, [saveConsent]);

  const saveCustom = useCallback((analytics: boolean) => {
    saveConsent({ essential: true, analytics });
  }, [saveConsent]);

  const reopenBanner = useCallback(() => {
    setShowBanner(true);
  }, []);

  return { consent, showBanner, acceptAll, rejectAll, saveCustom, reopenBanner };
}

/** Check if analytics consent is granted (for use outside React) */
export function hasAnalyticsConsent(): boolean {
  const c = readConsent();
  return c?.analytics === true;
}
