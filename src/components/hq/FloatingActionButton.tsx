import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRunQueue } from "@/hooks/useRunQueue";
import {
  Plus,
  X,
  Sparkles,
  Shield,
  TrendingUp,
  Brain,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
  onOpenTemplates?: () => void;
}

const quickActions = [
  { id: "brief", icon: Sparkles, label: "Brief IA", runType: "DAILY_EXECUTIVE_BRIEF", color: "bg-accent" },
  { id: "security", icon: Shield, label: "Audit", runType: "SECURITY_AUDIT_RLS", color: "bg-success" },
  { id: "marketing", icon: TrendingUp, label: "Marketing", runType: "MARKETING_WEEK_PLAN", color: "bg-warning" },
  { id: "competitive", icon: Brain, label: "Veille", runType: "COMPETITIVE_ANALYSIS", color: "bg-primary" },
  { id: "templates", icon: FileText, label: "Templates", runType: "", color: "bg-secondary" },
];

export function FloatingActionButton({ className, onOpenTemplates }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { enqueue } = useRunQueue();

  const handleAction = async (runType: string, actionId: string) => {
    if (actionId === "templates") {
      setIsOpen(false);
      onOpenTemplates?.();
      return;
    }
    
    setActiveAction(actionId);
    try {
      enqueue(runType);
    } finally {
      setTimeout(() => {
        setActiveAction(null);
        setIsOpen(false);
      }, 300);
    }
  };

  return (
    <div className={cn("fixed bottom-8 right-8 z-50", className)}>
      {/* Action Buttons */}
      <div className={cn(
        "absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {quickActions.map((action, index) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
                  action.color,
                  "hover:scale-110"
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                  transform: isOpen ? "scale(1)" : "scale(0.5)",
                }}
                onClick={() => handleAction(action.runType, action.id)}
                disabled={activeAction !== null}
              >
                {activeAction === action.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <action.icon className="h-5 w-5 text-white" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{action.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        variant="hero"
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300",
          isOpen && "rotate-45 bg-destructive hover:bg-destructive/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
