import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  actor_type: string;
  actor_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: any;
  created_at: string;
}

interface AuditExportButtonProps {
  logs: AuditLog[];
  className?: string;
}

export function AuditExportButton({ logs, className }: AuditExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!logs || logs.length === 0) {
      toast.error("Aucun log à exporter");
      return;
    }

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const header = "Horodatage\tActeur\tType Acteur\tAction\tRessource\tID Ressource\tDétails";
      const rows = logs.map(log => {
        return [
          new Date(log.created_at).toLocaleString("fr-FR"),
          log.actor_id || log.actor_type,
          log.actor_type,
          log.action,
          log.resource_type || "",
          log.resource_id || "",
          log.details ? JSON.stringify(log.details) : "",
        ].join("\t");
      });

      const content = [header, ...rows].join("\n");
      const blob = new Blob([content], { type: "text/tab-separated-values;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit_logs_emotionscare_${new Date().toISOString().split("T")[0]}.tsv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Export terminé", {
        description: `${logs.length} entrées exportées.`,
      });
    } catch (error) {
      toast.error("Erreur d'export", {
        description: "Impossible de générer le fichier d'export.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting || !logs || logs.length === 0}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Exporter ({logs?.length || 0})
    </Button>
  );
}
