import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import type { JournalEntry } from "@/hooks/useJournal";
import { startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import { type PeriodFilter, TYPE_LABELS, buildPDFHtml } from "./journalPdfBuilders";

type TypeFilter = "all" | "decision" | "milestone" | "note";

function filterByPeriod(entries: JournalEntry[], period: PeriodFilter): JournalEntry[] {
  if (period === "all") return entries;
  const now = new Date();
  const cutoff =
    period === "month" ? startOfMonth(now) :
    period === "quarter" ? startOfQuarter(now) :
    startOfYear(now);
  return entries.filter(e => new Date(e.created_at) >= cutoff);
}

function filterByType(entries: JournalEntry[], type: TypeFilter): JournalEntry[] {
  if (type === "all") return entries;
  if (type === "note") return entries.filter(e => e.entry_type === "note" || e.entry_type === "reflection");
  return entries.filter(e => e.entry_type === type);
}

export function JournalPDFExport({ entries }: { entries: JournalEntry[] }) {
  const [isExporting, setIsExporting] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = filterByType(filterByPeriod(entries, period), typeFilter);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const html = buildPDFHtml(filtered, period);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            URL.revokeObjectURL(url);
          }, 500);
        };
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tout</SelectItem>
          <SelectItem value="month">Ce mois</SelectItem>
          <SelectItem value="quarter">Ce trimestre</SelectItem>
          <SelectItem value="year">Cette année</SelectItem>
        </SelectContent>
      </Select>
      <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous types</SelectItem>
          <SelectItem value="decision">Décisions</SelectItem>
          <SelectItem value="milestone">Jalons</SelectItem>
          <SelectItem value="note">Notes</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExport} disabled={isExporting || filtered.length === 0}>
        {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
        Export PDF ({filtered.length})
      </Button>
    </div>
  );
}