import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleExport = () => {
    if (okrs.length === 0 && Object.keys(platformFeatures).length === 0) {
      toast({
        title: "Export impossible",
        description: "Aucune donnée disponible pour l'export. Connectez une source de données.",
        variant: "destructive",
      });
      return;
    }

    // Build Markdown content
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
      title: "Export réussi",
      description: "La roadmap a été exportée en Markdown.",
    });
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      Exporter Roadmap
    </Button>
  );
}
