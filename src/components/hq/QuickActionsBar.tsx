import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePendingApprovals } from "@/hooks/useHQData";
import { useRunQueue } from "@/hooks/useRunQueue";
import {
  Sparkles,
  Shield,
  TrendingUp,
  Brain,
  Loader2,
  Bell,
  Command,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsBarProps {
  onOpenCommand?: () => void;
  onOpenTemplates?: () => void;
  className?: string;
}

const quickActions = [
  { 
    id: "brief", 
    label: "Brief IA", 
    icon: Sparkles, 
    runType: "DAILY_EXECUTIVE_BRIEF",
    description: "Générer un brief exécutif complet"
  },
  { 
    id: "security", 
    label: "Audit", 
    icon: Shield, 
    runType: "SECURITY_AUDIT_RLS",
    description: "Lancer un audit de sécurité"
  },
  { 
    id: "marketing", 
    label: "Marketing", 
    icon: TrendingUp, 
    runType: "MARKETING_WEEK_PLAN",
    description: "Plan marketing de la semaine"
  },
  { 
    id: "competitive", 
    label: "Veille", 
    icon: Brain, 
    runType: "COMPETITIVE_ANALYSIS",
    description: "Analyse concurrentielle"
  },
];

export function QuickActionsBar({ onOpenCommand, onOpenTemplates, className }: QuickActionsBarProps) {
  const { enqueue, stats } = useRunQueue();
  const { data: pendingApprovals } = usePendingApprovals();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = async (runType: string, actionId: string) => {
    setActiveAction(actionId);
    try {
      enqueue(runType);
    } finally {
      // Quick visual feedback
      setTimeout(() => setActiveAction(null), 500);
    }
  };

  const pendingCount = pendingApprovals?.length || 0;

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-xl bg-muted/30 backdrop-blur-sm border",
      className
    )}>
      {/* Command Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCommand}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Command className="h-4 w-4" />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              ⌘K
            </kbd>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ouvrir la palette de commandes</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border" />

      {/* Quick Actions */}
      {quickActions.map((action) => (
        <Tooltip key={action.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(action.runType, action.id)}
              disabled={activeAction !== null}
              className={cn(
                "gap-2 transition-all",
                activeAction === action.id && "bg-accent/20 text-accent"
              )}
            >
              {activeAction === action.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <action.icon className="h-4 w-4" />
              )}
              <span className="hidden md:inline">{action.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{action.description}</TooltipContent>
        </Tooltip>
      ))}

      <div className="w-px h-6 bg-border" />

      {/* Templates Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenTemplates}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden lg:inline">Templates</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Lancer un run personnalisé</TooltipContent>
      </Tooltip>

      {/* Notifications */}
      {pendingCount > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                >
                  {pendingCount}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{pendingCount} approbation(s) en attente</TooltipContent>
          </Tooltip>
        </>
      )}
      
      {/* Queue status indicator */}
      {stats.running > 0 && (
        <Badge variant="gold" className="ml-2">
          {stats.running} run{stats.running > 1 ? 's' : ''} en cours
        </Badge>
      )}
    </div>
  );
}
