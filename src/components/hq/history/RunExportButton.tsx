import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Run } from "@/hooks/useHQData";
import { useTranslation } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

interface RunExportButtonProps {
  runs: Run[];
}

export function RunExportButton({ runs }: RunExportButtonProps) {
  const { toast } = useToast();
  const t = useTranslation(hqCommon);

  const handleExport = () => {
    if (!runs || runs.length === 0) {
      toast({
        title: t.noRunData,
        description: t.noRunToExport,
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Type", "Statut", "Plateforme", "Résumé"];
    const rows = runs.map((run) => [
      new Date(run.created_at).toLocaleString("fr-FR"),
      run.run_type,
      run.status,
      run.platform_key || "—",
      (run.executive_summary || "—").replace(/\t/g, " ").replace(/\n/g, " ").slice(0, 100),
    ]);

    const content = [
      headers.join("\t"),
      ...rows.map((row) => row.join("\t")),
    ].join("\n");

    const blob = new Blob([content], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `runs-export-${new Date().toISOString().slice(0, 10)}.tsv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: t.exportSuccess,
      description: `${runs.length} ${t.runsExported}`,
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      {t.export}
    </Button>
  );
}
