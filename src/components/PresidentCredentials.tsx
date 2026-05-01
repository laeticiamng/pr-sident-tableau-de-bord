import { ExternalLink, BadgeCheck, Stethoscope } from "lucide-react";
import { COMPANY_PROFILE } from "@/lib/constants";
import { openExternalLink } from "@/lib/openExternalLink";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { medregTranslations } from "@/i18n/medreg";

interface PresidentCredentialsProps {
  /** Variante visuelle. `panel` = carte large, `inline` = bandeau compact. */
  variant?: "panel" | "inline";
  className?: string;
}

/**
 * Affiche la preuve publique d'identité professionnelle de la Présidente
 * (inscription officielle au registre suisse MedReg). Renforce la crédibilité
 * sur les pages publiques sensibles (Trust, Vision, À propos).
 *
 * Source vérifiable : Plateforme des professions de la santé de la
 * Confédération suisse — n° GLN public.
 */
export const PresidentCredentials = ({
  variant = "panel",
  className = "",
}: PresidentCredentialsProps) => {
  const t = useTranslation(medregTranslations);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openExternalLink(
      COMPANY_PROFILE.presidentMedRegUrl,
      t.panel.registryLabel,
      t.errors,
    );
  };

  if (variant === "inline") {
    return (
      <a
        href={COMPANY_PROFILE.presidentMedRegUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full border border-success/30 bg-success/5 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-success hover:bg-success/10 transition-colors",
          className,
        )}
        aria-label={t.panel.inlineAriaLabel(COMPANY_PROFILE.presidentMedRegName)}
      >
        <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          <span className="sm:hidden">
            {t.badgeLabel} · MedReg
          </span>
          <span className="hidden sm:inline">
            {t.badgeLabel} — {COMPANY_PROFILE.presidentMedRegProfession} ·
            {" "}{t.glnPrefix} {COMPANY_PROFILE.presidentMedRegGLN}
          </span>
        </span>
        <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
      </a>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-secondary/30 p-4 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
          <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <BadgeCheck className="h-4 w-4 text-success" />
            <h3 className="font-semibold text-base">
              {t.panel.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {t.panel.description(COMPANY_PROFILE.presidentMedRegProfession)}
          </p>
          <dl className="grid gap-3 grid-cols-1 sm:grid-cols-2 text-sm mb-4">
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.panel.fieldName}
              </dt>
              <dd className="font-medium break-words">
                {COMPANY_PROFILE.presidentMedRegName}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.panel.fieldProfession}
              </dt>
              <dd className="font-medium">
                {COMPANY_PROFILE.presidentMedRegProfession}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.panel.fieldGLN}
              </dt>
              <dd className="font-mono text-sm break-all">
                {COMPANY_PROFILE.presidentMedRegGLN}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.panel.fieldRegistry}
              </dt>
              <dd className="font-medium break-words">
                {COMPANY_PROFILE.presidentMedRegRegistry}
              </dd>
            </div>
          </dl>
          <a
            href={COMPANY_PROFILE.presidentMedRegUrl}
            onClick={handleClick}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t.panel.verifyCta}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PresidentCredentials;