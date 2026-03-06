import { useState } from "react";
import { Shield, Cookie, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/LanguageContext";
import { cookieTranslations } from "@/i18n/cookies";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function CookieConsentBanner() {
  const t = useTranslation(cookieTranslations);
  const { showBanner, acceptAll, rejectAll, saveCustom } = useCookieConsent();
  const [expanded, setExpanded] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-2 sm:p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-2xl rounded-xl sm:rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
        <div className="p-3 sm:p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 shrink-0">
              <Cookie className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-primary" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground">{t.title}</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {t.description}
          </p>

          {/* Expandable details */}
          {expanded && (
            <div className="mb-4 space-y-3 rounded-xl bg-muted/50 p-4">
              {/* Essential */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t.essential}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-6">{t.essentialDesc}</p>
                </div>
                <Switch checked disabled className="data-[state=checked]:bg-primary" />
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Cookie className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t.analytics}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-6">{t.analyticsDesc}</p>
                </div>
                <Switch
                  checked={analyticsChecked}
                  onCheckedChange={setAnalyticsChecked}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {expanded ? (
              <Button onClick={() => saveCustom(analyticsChecked)} className="flex-1">
                {t.save}
              </Button>
            ) : (
              <>
                <Button onClick={acceptAll} className="flex-1">
                  {t.acceptAll}
                </Button>
                <Button onClick={rejectAll} variant="outline" className="flex-1">
                  {t.rejectAll}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-muted-foreground gap-1"
            >
              {t.settings}
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          {/* Links */}
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <Link
              to="/legal/cookies"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              {t.cookiePolicyLink}
            </Link>
            <span>·</span>
            <Link
              to="/legal/confidentialite"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              {t.privacyLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
