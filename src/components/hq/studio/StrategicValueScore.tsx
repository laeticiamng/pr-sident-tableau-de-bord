import { cn } from "@/lib/utils";

interface StrategicValueScoreProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function scoreTone(score: number): { ring: string; text: string; label: string } {
  if (score >= 80) return { ring: "stroke-success", text: "text-success", label: "Stratégique" };
  if (score >= 60) return { ring: "stroke-primary", text: "text-primary", label: "Solide" };
  if (score >= 40) return { ring: "stroke-warning", text: "text-warning", label: "À renforcer" };
  return { ring: "stroke-destructive", text: "text-destructive", label: "Faible" };
}

export function StrategicValueScore({
  score,
  size = "md",
  showLabel = true,
  className,
}: StrategicValueScoreProps) {
  const value = typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;
  const tone = scoreTone(value);
  const dimensions = size === "sm" ? 56 : size === "lg" ? 96 : 72;
  const stroke = size === "sm" ? 5 : 7;
  const radius = (dimensions - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        <svg width={dimensions} height={dimensions} className="-rotate-90">
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-muted/40 fill-none"
          />
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("fill-none transition-all duration-500", tone.ring)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold tabular-nums", tone.text, size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg")}>
            {score == null ? "—" : value}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-[11px] font-medium uppercase tracking-wider", tone.text)}>
          {tone.label}
        </span>
      )}
    </div>
  );
}
