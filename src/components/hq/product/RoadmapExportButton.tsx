import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

interface OKR {
  objective: string;
  progress: number;
  status: string;
  keyResults: { name: string; progress: number }[];
}

interface RoadmapExportButtonProps {
  okrs?: OKR[];
  platformFeatures?: Record<string, { delivered: number; inProgress: number; blocked: number }>;
  featureRequests?: { title: string; platform: string; votes: number; status: string }[];
  upcomingReleases?: { version: string; platform: string; date: string; features: number }[];
}

export function RoadmapExportButton({ 
  okrs = [], 
  platformFeatures = {}, 
  featureRequests = [], 
  upcomingReleases = [] 
}: RoadmapExportButtonProps) {
  const { toast } = useToast();
  const t = useTranslation(hqCommon);

  const handleExport = () => {
    if (okrs.length === 0 && Object.keys(platformFeatures).length === 0) {
      toast({
        title: t.exportImpossible,
        description: t.noDataForExport,
        variant: "destructive",
      });
      return;
    }

    const lines: string[] = [
      "# Roadmap Produit EMOTIONSCARE SASU",
      `Exporté le ${new Date().toLocaleDateString("fr-FR")}`,
      "",
      "## OKRs Q1 2026",
      "",
    ];

    okrs.forEach((okr) => {
      lines.push(`### ${okr.objective} (${okr.progress}%)`);
      lines.push(`Statut: ${okr.status === "on_track" ? "✅ Sur la bonne voie" : "⚠️ À risque"}`);
      lines.push("");
      okr.keyResults.forEach((kr) => {
        lines.push(`- ${kr.name}: ${kr.progress}%`);
      });
      lines.push("");
    });

    if (Object.keys(platformFeatures).length > 0) {
      lines.push("## Features par Plateforme", "");
      Object.entries(platformFeatures).forEach(([key, features]) => {
        lines.push(`### ${key}`);
        lines.push(`- ✅ Livrées: ${features.delivered}`);
        lines.push(`- 🔄 En cours: ${features.inProgress}`);
        lines.push(`- 🚫 Bloquées: ${features.blocked}`);
        lines.push("");
      });
    }

    if (featureRequests.length > 0) {
      lines.push("## Demandes de Fonctionnalités", "");
      featureRequests.forEach((req) => {
        lines.push(`- **${req.title}** (${req.platform}) - ${req.votes} votes - ${req.status}`);
      });
      lines.push("");
    }

    if (upcomingReleases.length > 0) {
      lines.push("## Prochaines Releases", "");
      upcomingReleases.forEach((rel) => {
        lines.push(`- **${rel.version}** - ${rel.platform} - ${new Date(rel.date).toLocaleDateString("fr-FR")} (${rel.features} features)`);
      });
    }

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roadmap-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: t.exportSuccess,
      description: t.roadmapExported,
    });
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      {t.exportRoadmap}
    </Button>
  );
}
