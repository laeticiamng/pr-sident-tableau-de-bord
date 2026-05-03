import { Link } from "react-router-dom";
import { Sparkles, Lightbulb, Megaphone, FileText, Handshake, Users, FolderOpen, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudioCockpit } from "@/components/hq/studio/StudioCockpit";
import { StudioPipelineKanban } from "@/components/hq/studio/StudioPipelineKanban";
import { TopOpportunitiesTable } from "@/components/hq/studio/TopOpportunitiesTable";
import { StudioDecisionInbox } from "@/components/hq/studio/StudioDecisionInbox";

const QUICK_LINKS = [
  { href: "/hq/studio/opportunites", icon: Lightbulb, label: "Radar Opportunités" },
  { href: "/hq/studio/appels", icon: Megaphone, label: "Appels à projets" },
  { href: "/hq/studio/blueprints", icon: FileText, label: "Blueprints 360°" },
  { href: "/hq/studio/deals", icon: Handshake, label: "Equity Deals" },
  { href: "/hq/studio/advisory", icon: Users, label: "Advisory" },
  { href: "/hq/studio/templates", icon: FolderOpen, label: "Templates" },
  { href: "/hq/studio/legal", icon: Scale, label: "Protection juridique" },
];

export default function StudioCockpitPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="absolute -top-16 -right-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              EmotionSphere Venture Studio · Equity-based
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              Studio d'architecture stratégique pour projets complexes
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl">
              Nous ne vendons pas du temps : nous échangeons la conception stratégique d'un projet contre une participation minoritaire dans sa valeur future. Règle interne 80/20 — 80% sélection, 20% création.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/hq/studio/opportunites">Nouvelle opportunité</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link to="/hq/studio/blueprints">Générer un Blueprint</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-background/50 p-3 text-center hover:bg-muted/30 transition-colors"
          >
            <link.icon className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-medium leading-tight">{link.label}</span>
          </Link>
        ))}
      </div>

      <StudioCockpit />

      <StudioPipelineKanban />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopOpportunitiesTable />
        <StudioDecisionInbox />
      </div>

      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-4 sm:p-5 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Boussole produit.</span> EmotionSphere Studio ne donne pas des idées : il transforme des problèmes complexes en projets activables, finançables et stratégiquement différenciants.
          </p>
          <p>
            Les recommandations de structuration juridique, fiscale ou capitalistique sont des aides à la décision et doivent être validées par un avocat ou expert-comptable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
