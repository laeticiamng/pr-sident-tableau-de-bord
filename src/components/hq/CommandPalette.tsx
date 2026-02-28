import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useExecuteRun } from "@/hooks/useHQData";
import {
  LayoutDashboard,
  Gauge,
  Layers,
  Users,
  Calendar,
  CheckSquare,
  History,
  Shield,
  TrendingUp,
  DollarSign,
  Package,
  Settings,
  FileText,
  Building2,
  Search,
  Sparkles,
  Rocket,
  Brain,
  GitBranch,
  Briefcase,
  HeadphonesIcon,
  Zap,
  Activity,
} from "lucide-react";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const navigationItems = [
  { label: "Briefing Room", icon: LayoutDashboard, href: "/hq" },
  { label: "Cockpit Dirigeant", icon: Gauge, href: "/hq/cockpit" },
  { label: "Plateformes", icon: Layers, href: "/hq/plateformes" },
  { label: "Équipe Executive", icon: Users, href: "/hq/equipe-executive" },
  { label: "Réunions", icon: Calendar, href: "/hq/reunions" },
  { label: "Approbations", icon: CheckSquare, href: "/hq/approbations" },
  { label: "Historique", icon: History, href: "/hq/historique" },
  { label: "Sécurité", icon: Shield, href: "/hq/securite" },
  { label: "Marketing", icon: TrendingUp, href: "/hq/marketing" },
  { label: "Ventes", icon: Briefcase, href: "/hq/ventes" },
  { label: "Finance", icon: DollarSign, href: "/hq/finance" },
  { label: "Produit", icon: Package, href: "/hq/produit" },
  { label: "Engineering", icon: Settings, href: "/hq/engineering" },
  { label: "Support", icon: HeadphonesIcon, href: "/hq/support" },
  { label: "Audit Log", icon: FileText, href: "/hq/audit" },
  { label: "Profil Entreprise", icon: Building2, href: "/hq/entreprise" },
  { label: "Diagnostics", icon: Activity, href: "/hq/diagnostics" },
];

const runItems = [
  { label: "Brief Exécutif Quotidien", type: "DAILY_EXECUTIVE_BRIEF", icon: Sparkles },
  { label: "Réunion Standup DG", type: "CEO_STANDUP_MEETING", icon: Users },
  { label: "Audit Sécurité RLS", type: "SECURITY_AUDIT_RLS", icon: Shield },
  { label: "Plan Marketing Semaine", type: "MARKETING_WEEK_PLAN", icon: TrendingUp },
  { label: "Gate Check Release", type: "RELEASE_GATE_CHECK", icon: Rocket },
  { label: "Analyse Concurrentielle", type: "COMPETITIVE_ANALYSIS", icon: Brain },
  { label: "Revue Plateforme", type: "PLATFORM_STATUS_REVIEW", icon: Layers },
];

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  
  const navigate = useNavigate();
  const executeRun = useExecuteRun();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const handleNavigation = useCallback((href: string) => {
    navigate(href);
    setOpen(false);
  }, [navigate, setOpen]);

  const handleRun = useCallback((runType: string) => {
    executeRun.mutate({ run_type: runType as import("@/lib/run-types-registry").RunType });
    setOpen(false);
  }, [executeRun, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <VisuallyHidden>
        <DialogTitle>Palette de commandes</DialogTitle>
        <DialogDescription>Recherchez des pages ou lancez des actions IA</DialogDescription>
      </VisuallyHidden>
      <Command className="rounded-lg border shadow-2xl">
        <CommandInput placeholder="Rechercher ou lancer une action..." className="h-14 text-lg" />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          <CommandGroup heading="Actions IA Rapides">
            {runItems.map((item) => (
              <CommandItem
                key={item.type}
                onSelect={() => handleRun(item.type)}
                className="cursor-pointer py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <item.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">Exécuter avec l'IA</p>
                  </div>
                </div>
                <Zap className="ml-auto h-4 w-4 text-accent" />
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleNavigation(item.href)}
                className="cursor-pointer"
              >
                <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Raccourci: ⌘K ou Ctrl+K</span>
            <span>↑↓ naviguer · ↵ sélectionner · esc fermer</span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}
