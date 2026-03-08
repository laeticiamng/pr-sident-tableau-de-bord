import { useState } from "react";
import { X, Sparkles, Megaphone, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const bannerVariants = cva(
  "group relative flex items-center gap-3 transition-all duration-500 animate-fade-in",
  {
    variants: {
      variant: {
        pill: "mx-auto w-fit px-4 py-2 rounded-full border text-sm font-medium",
        topbar: "w-full px-4 py-2.5 text-sm font-medium justify-center",
        glassmorphic: "mx-4 px-5 py-3.5 rounded-2xl border text-sm backdrop-blur-xl shadow-xl",
      },
      tone: {
        info: "",
        success: "",
        warning: "",
        premium: "",
        dark: "",
      },
    },
    compoundVariants: [
      // Pill variants
      { variant: "pill", tone: "info", className: "bg-secondary/80 border-border text-foreground hover:border-primary/30 hover:bg-secondary" },
      { variant: "pill", tone: "success", className: "bg-success/10 border-success/30 text-success hover:bg-success/15" },
      { variant: "pill", tone: "warning", className: "bg-warning/10 border-warning/30 text-warning-foreground hover:bg-warning/15" },
      { variant: "pill", tone: "premium", className: "bg-accent/10 border-accent/30 text-accent-foreground hover:bg-accent/15 hover:border-accent/50" },
      { variant: "pill", tone: "dark", className: "bg-foreground text-background border-foreground/80 hover:bg-foreground/90" },

      // Topbar variants
      { variant: "topbar", tone: "info", className: "bg-primary text-primary-foreground" },
      { variant: "topbar", tone: "success", className: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" },
      { variant: "topbar", tone: "warning", className: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]" },
      { variant: "topbar", tone: "premium", className: "bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(38_80%_60%)] text-accent-foreground" },
      { variant: "topbar", tone: "dark", className: "bg-foreground text-background" },

      // Glassmorphic variants
      { variant: "glassmorphic", tone: "info", className: "bg-secondary/60 border-border/50 text-foreground" },
      { variant: "glassmorphic", tone: "success", className: "bg-success/10 border-success/20 text-foreground" },
      { variant: "glassmorphic", tone: "warning", className: "bg-warning/10 border-warning/20 text-foreground" },
      { variant: "glassmorphic", tone: "premium", className: "bg-accent/5 border-accent/20 text-foreground shadow-[0_0_30px_-5px_hsl(var(--accent)/0.15)]" },
      { variant: "glassmorphic", tone: "dark", className: "bg-foreground/95 border-foreground/20 text-background shadow-[0_8px_32px_-8px_hsl(0_0%_0%/0.5)]" },
    ],
    defaultVariants: {
      variant: "pill",
      tone: "info",
    },
  }
);

const iconMap = {
  sparkles: Sparkles,
  megaphone: Megaphone,
  warning: AlertTriangle,
  info: Info,
};

export interface AnnouncementBannerProps extends VariantProps<typeof bannerVariants> {
  /** Main announcement text */
  message: string;
  /** Optional CTA label */
  ctaLabel?: string;
  /** CTA click handler or href */
  onCtaClick?: () => void;
  ctaHref?: string;
  /** Icon type */
  icon?: keyof typeof iconMap;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Unique key for localStorage persistence */
  dismissKey?: string;
  /** Additional className */
  className?: string;
}

export function AnnouncementBanner({
  message,
  ctaLabel,
  onCtaClick,
  ctaHref,
  icon = "sparkles",
  dismissible = true,
  dismissKey,
  variant,
  tone,
  className,
}: AnnouncementBannerProps) {
  const storageKey = dismissKey ? `announcement-dismissed-${dismissKey}` : null;
  const [dismissed, setDismissed] = useState(() => {
    if (!storageKey) return false;
    try { return localStorage.getItem(storageKey) === "true"; } catch { return false; }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      try { localStorage.setItem(storageKey, "true"); } catch {}
    }
  };

  const IconComponent = iconMap[icon];
  const isDark = tone === "dark";
  const isTopbar = variant === "topbar";

  const ctaElement = ctaLabel && (
    ctaHref ? (
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1 font-semibold transition-all duration-200",
          "hover:gap-2 whitespace-nowrap",
          isDark ? "text-background/90 hover:text-background" : "text-primary hover:text-primary/80",
          isTopbar && !isDark && "text-primary-foreground/90 hover:text-primary-foreground underline underline-offset-2"
        )}
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    ) : (
      <button
        onClick={onCtaClick}
        className={cn(
          "inline-flex items-center gap-1 font-semibold transition-all duration-200",
          "hover:gap-2 whitespace-nowrap",
          isDark ? "text-background/90 hover:text-background" : "text-primary hover:text-primary/80",
          isTopbar && !isDark && "text-primary-foreground/90 hover:text-primary-foreground underline underline-offset-2"
        )}
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    )
  );

  return (
    <div className={cn(bannerVariants({ variant, tone }), className)}>
      <IconComponent className={cn(
        "h-4 w-4 flex-shrink-0",
        tone === "premium" && "text-accent",
        tone === "success" && "text-[hsl(var(--success))]",
        tone === "warning" && "text-[hsl(var(--warning))]",
        isDark && variant !== "topbar" && "text-background/70",
        isTopbar && "text-inherit"
      )} />

      <span className={cn(
        "flex-1",
        isTopbar && "text-center"
      )}>
        {message}
      </span>

      {ctaElement}

      {dismissible && (
        <button
          onClick={handleDismiss}
          className={cn(
            "flex-shrink-0 p-1 rounded-full transition-all duration-200",
            "hover:bg-foreground/10",
            isDark && "hover:bg-background/20",
            isTopbar && !isDark && "hover:bg-primary-foreground/20"
          )}
          aria-label="Fermer l'annonce"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
