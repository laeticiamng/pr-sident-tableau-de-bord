import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  variant?: "light" | "dark" | "accent";
  blur?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function GlassmorphicCard({
  children,
  className,
  variant = "light",
  blur = "md",
  hover = true,
}: GlassmorphicCardProps) {
  const variantClasses = {
    light: "bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/50",
    dark: "bg-slate-900/60 dark:bg-slate-950/70 border-slate-700/30 text-white",
    accent: "bg-accent/10 border-accent/20 dark:bg-accent/5",
  };

  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-lg transition-all duration-300",
        variantClasses[variant],
        blurClasses[blur],
        hover && "hover:shadow-xl hover:scale-[1.01] hover:border-accent/40",
        className
      )}
    >
      {children}
    </div>
  );
}
