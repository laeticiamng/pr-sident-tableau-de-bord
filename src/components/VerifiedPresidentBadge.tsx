import type { MouseEvent } from "react";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { COMPANY_PROFILE } from "@/lib/constants";
import { openExternalLink } from "@/lib/openExternalLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
type Tone = "light" | "dark";

interface VerifiedPresidentBadgeProps {
  size?: Size;
  /** `light` = pour fond clair, `dark` = pour fond sombre/hero. */
  tone?: Tone;
  /** Si false, n'affiche que le label court (utile en mobile dense). */
  showGLN?: boolean;
  className?: string;
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

/**
 * Badge compact « Présidente vérifiée » pour les pages publiques.
 * Pointe vers le registre public suisse MedReg avec gestion d'erreurs
 * (URL invalide, popup bloqué).
 */
export const VerifiedPresidentBadge = ({
  size = "md",
  tone = "light",
  showGLN = true,
  className,
}: VerifiedPresidentBadgeProps) => {
  const sz = SIZE_CLASSES[size];

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openExternalLink(COMPANY_PROFILE.presidentMedRegUrl, "le registre MedReg");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={COMPANY_PROFILE.presidentMedRegUrl}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Présidente vérifiée — ${COMPANY_PROFILE.presidentMedRegProfession} inscrite au registre MedReg sous le GLN ${COMPANY_PROFILE.presidentMedRegGLN}. Ouvrir le registre officiel.`}
          className={cn(
            "inline-flex max-w-full items-center rounded-full border font-medium transition-colors",
            sz.wrap,
            sz.text,
            TONE_CLASSES[tone],
            className,
          )}
        >
          <BadgeCheck className={cn("shrink-0", sz.icon)} />
          <span className="truncate">
            Présidente vérifiée
            {showGLN && (
              <span className="hidden sm:inline opacity-90">
                {" "}· GLN {COMPANY_PROFILE.presidentMedRegGLN}
              </span>
            )}
          </span>
          <ExternalLink className={cn("shrink-0 opacity-70", sz.icon)} />
        </a>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs">
        Inscription officielle de {COMPANY_PROFILE.presidentMedRegName} au
        registre suisse {COMPANY_PROFILE.presidentMedRegRegistry}. Cliquez pour
        vérifier sur le portail public.
      </TooltipContent>
    </Tooltip>
  );
};

export default VerifiedPresidentBadge;