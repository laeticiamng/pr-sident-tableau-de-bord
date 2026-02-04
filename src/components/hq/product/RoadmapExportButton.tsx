import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PLATFORM_FEATURES, FEATURE_REQUESTS, UPCOMING_RELEASES, PRODUCT_OKRS } from "@/lib/mock-data";

export function RoadmapExportButton() {
  const { toast } = useToast();

  const handleExport = () => {
    // Build Markdown content
    const lines: string[] = [
      "# Roadmap Produit EMOTIONSCARE SASU",
      `Exporté le ${new Date().toLocaleDateString("fr-FR")}`,
      "",
      "## OKRs Q1 2026",
      "",
    ];

    PRODUCT_OKRS.forEach((okr) => {
      lines.push(`### ${okr.objective} (${okr.progress}%)`);
      lines.push(`Statut: ${okr.status === "on_track" ? "✅ Sur la bonne voie" : "⚠️ À risque"}`);
      lines.push("");
      okr.keyResults.forEach((kr) => {
        lines.push(`- ${kr.name}: ${kr.progress}%`);
      });
      lines.push("");
    });

    lines.push("## Features par Plateforme", "");
    Object.entries(PLATFORM_FEATURES).forEach(([key, features]) => {
      lines.push(`### ${key}`);
      lines.push(`- ✅ Livrées: ${features.delivered}`);
      lines.push(`- 🔄 En cours: ${features.inProgress}`);
      lines.push(`- 🚫 Bloquées: ${features.blocked}`);
      lines.push("");
    });

    lines.push("## Demandes de Fonctionnalités", "");
    FEATURE_REQUESTS.forEach((req) => {
      lines.push(`- **${req.title}** (${req.platform}) - ${req.votes} votes - ${req.status}`);
    });
    lines.push("");

    lines.push("## Prochaines Releases", "");
    UPCOMING_RELEASES.forEach((rel) => {
      lines.push(`- **${rel.version}** - ${rel.platform} - ${new Date(rel.date).toLocaleDateString("fr-FR")} (${rel.features} features)`);
    });

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
