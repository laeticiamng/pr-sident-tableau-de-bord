import { useState, type MouseEvent } from "react";
import { BadgeCheck, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { COMPANY_PROFILE } from "@/lib/constants";
import { openExternalLink } from "@/lib/openExternalLink";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { medregTranslations } from "@/i18n/medreg";
import { useAnalytics } from "@/hooks/useAnalytics";

type Size = "sm" | "md" | "lg";
type Tone = "light" | "dark";

/**
 * États visuels du badge :
 * - `ready`        : URL valide, prêt à être cliqué (Empty/idle).
 * - `loading`      : feedback bref pendant l'ouverture du registre.
 * - `success`      : feedback bref confirmant l'ouverture (auto-reset).
 * - `error`        : dernière tentative échouée (popup bloqué, etc.).
 * - `unavailable`  : URL constante invalide / non-HTTPS — bouton désactivé visuellement.
 */
export type VerifiedBadgeState =
  | "ready"
  | "loading"
  | "success"
  | "error"
  | "unavailable";

interface VerifiedPresidentBadgeProps {
  size?: Size;
  /** `light` = pour fond clair, `dark` = pour fond sombre/hero. */
  tone?: Tone;
  /** Si false, n'affiche que le label court (utile en mobile dense). */
  showGLN?: boolean;
  className?: string;
  /** Notifie le parent (ex : HeroVerifiedSlot) des changements d'état. */
  onStateChange?: (state: VerifiedBadgeState) => void;
}

const SIZE_CLASSES: Record<Size, { wrap: string; icon: string; text: string }> = {
  sm: { wrap: "px-2.5 py-1 gap-1.5", icon: "h-3 w-3", text: "text-[11px]" },
  md: { wrap: "px-3 py-1.5 gap-2", icon: "h-3.5 w-3.5", text: "text-xs" },
  lg: { wrap: "px-4 py-2 gap-2", icon: "h-4 w-4", text: "text-sm" },
};

const TONE_CLASSES: Record<Tone, string> = {
  light: "border-success/30 bg-success/5 text-success hover:bg-success/10",
  dark: "border-white/30 bg-white/10 text-white hover:bg-white/15 backdrop-blur-sm",
};

const ERROR_TONE_CLASSES: Record<Tone, string> = {
  light: "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10",
  dark: "border-white/30 bg-white/5 text-white/80 hover:bg-white/10 backdrop-blur-sm",
};

const UNAVAILABLE_TONE_CLASSES: Record<Tone, string> = {
  light: "border-muted-foreground/30 bg-muted/40 text-muted-foreground cursor-not-allowed",
  dark: "border-white/15 bg-white/5 text-white/60 backdrop-blur-sm cursor-not-allowed",
};

/**
 * Badge compact « Présidente vérifiée » pour les pages publiques.
 * Pointe vers le registre public suisse MedReg avec :
 * - i18n centralisé (FR/EN/DE) via `medregTranslations`,
 * - états Loading / Success / Error / Unavailable,
 * - audit log analytics pour chaque tentative d'ouverture.
 */
export const VerifiedPresidentBadge = ({
  size = "md",
  tone = "light",
  showGLN = true,
  className,
  onStateChange,
}: VerifiedPresidentBadgeProps) => {
  const sz = SIZE_CLASSES[size];
  const t = useTranslation(medregTranslations);
  const { trackEvent } = useAnalytics();

  // Pré-validation de l'URL au render — détermine si l'état initial est
  // `ready` ou `unavailable`.
  const rawUrl = COMPANY_PROFILE.presidentMedRegUrl;
  let safeUrl: string | null = null;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      safeUrl = parsed.toString();
    }
  } catch {
    safeUrl = null;
  }

  const initialState: VerifiedBadgeState = safeUrl ? "ready" : "unavailable";
  const [state, setState] = useState<VerifiedBadgeState>(initialState);

  const updateState = (next: VerifiedBadgeState) => {
    setState(next);
    onStateChange?.(next);
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!safeUrl) {
      // URL constante invalide — pas de tentative d'ouverture, on informe.
      toast.error(t.errors.unavailableTitle, {
        description: t.errors.unavailableDescription(
          COMPANY_PROFILE.presidentMedRegGLN,
        ),
      });
      void trackEvent({
        eventType: "cta_click",
        eventName: "medreg_link_click",
        eventData: {
          status: "failed",
          reason: "unavailable_url",
          gln: COMPANY_PROFILE.presidentMedRegGLN,
        },
      });
      updateState("unavailable");
      return;
    }

    updateState("loading");

    const result = openExternalLink(safeUrl, "MedReg", {
      invalidUrlTitle: t.errors.invalidUrlTitle,
      invalidUrlDescription: t.errors.invalidUrlDescription("MedReg"),
      insecureProtocolTitle: t.errors.insecureProtocolTitle,
      insecureProtocolDescription: t.errors.insecureProtocolDescription,
      blockedTitle: t.errors.blockedTitle,
      blockedDescription: t.errors.blockedDescription,
      genericTitle: t.errors.genericTitle,
      genericDescription: t.errors.genericDescription,
    });

    void trackEvent({
      eventType: "cta_click",
      eventName: "medreg_link_click",
      eventData: {
        status: result.ok ? "success" : "failed",
        reason: result.reason ?? result.status,
        gln: COMPANY_PROFILE.presidentMedRegGLN,
      },
    });

    if (result.ok) {
      updateState("success");
      // Auto-reset à `ready` après 2s pour rester réutilisable.
      window.setTimeout(() => updateState("ready"), 2000);
    } else {
      updateState("error");
      window.setTimeout(() => updateState("ready"), 4000);
    }
  };

  const isDisabled = state === "unavailable";
  const toneClass =
    state === "unavailable"
      ? UNAVAILABLE_TONE_CLASSES[tone]
      : state === "error"
        ? ERROR_TONE_CLASSES[tone]
        : TONE_CLASSES[tone];

  const Icon =
    state === "loading"
      ? Loader2
      : state === "unavailable" || state === "error"
        ? AlertCircle
        : BadgeCheck;

  const label =
    state === "loading"
      ? t.loadingLabel
      : state === "unavailable"
        ? t.unavailableLabel
        : t.badgeLabel;

  // Annonce vocale pour lecteurs d'écran à chaque transition d'état.
  // `error`/`success`/`unavailable` → assertif, `loading` → poli.
  const liveMessage =
    state === "loading"
      ? t.liveAnnouncements.loading
      : state === "success"
        ? t.liveAnnouncements.success
        : state === "error"
          ? t.liveAnnouncements.error
          : state === "unavailable"
            ? t.liveAnnouncements.unavailable
            : "";
  const liveMode: "polite" | "assertive" =
    state === "error" || state === "unavailable" ? "assertive" : "polite";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={safeUrl ?? "#"}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer"
          role="link"
          aria-label={t.ariaLabel(
            COMPANY_PROFILE.presidentMedRegProfession,
            COMPANY_PROFILE.presidentMedRegGLN,
          )}
          aria-disabled={isDisabled}
          aria-busy={state === "loading"}
          aria-describedby="medreg-badge-status"
          data-state={state}
          className={cn(
            "inline-flex max-w-full items-center rounded-full border font-medium transition-colors",
            sz.wrap,
            sz.text,
            toneClass,
            className,
          )}
        >
          <Icon
            className={cn(
              "shrink-0",
              sz.icon,
              state === "loading" && "animate-spin",
            )}
            aria-hidden="true"
          />
          <span className="truncate">
            {label}
            {showGLN && state !== "loading" && state !== "unavailable" && (
              <span className="hidden sm:inline opacity-90">
                {" "}· {t.glnPrefix} {COMPANY_PROFILE.presidentMedRegGLN}
              </span>
            )}
          </span>
          {state !== "loading" && state !== "unavailable" && (
            <ExternalLink
              className={cn("shrink-0 opacity-70", sz.icon)}
              aria-hidden="true"
            />
          )}
        </a>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs">
        {t.tooltipBody(
          COMPANY_PROFILE.presidentMedRegName,
          COMPANY_PROFILE.presidentMedRegRegistry,
        )}
      </TooltipContent>
      {/* Région live sr-only : annonce les transitions d'état aux lecteurs
          d'écran sans perturber le rendu visuel. */}
      <span
        id="medreg-badge-status"
        role="status"
        aria-live={liveMode}
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </span>
    </Tooltip>
  );
};

export default VerifiedPresidentBadge;
