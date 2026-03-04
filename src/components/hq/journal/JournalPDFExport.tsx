import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import type { JournalEntry } from "@/hooks/useJournal";
import { format, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  decision: "Décision",
  note: "Note",
  milestone: "Jalon",
  reflection: "Réflexion",
};

type PeriodFilter = "all" | "month" | "quarter" | "year";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  all: "Tout",
  month: "Ce mois",
  quarter: "Ce trimestre",
  year: "Cette année",
};

function filterByPeriod(entries: JournalEntry[], period: PeriodFilter): JournalEntry[] {
  if (period === "all") return entries;
  const now = new Date();
  const cutoff =
    period === "month" ? startOfMonth(now) :
    period === "quarter" ? startOfQuarter(now) :
    startOfYear(now);
  return entries.filter(e => new Date(e.created_at) >= cutoff);
}

export function JournalPDFExport({ entries }: { entries: JournalEntry[] }) {
  const [isExporting, setIsExporting] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>("all");

  const filtered = filterByPeriod(entries, period);

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
      <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExport} disabled={isExporting || filtered.length === 0}>
        {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
        Export PDF ({filtered.length})
      </Button>
    </div>
  );
}

function buildPDFHtml(entries: JournalEntry[], period: PeriodFilter): string {
  const now = new Date();
  const dateStr = format(now, "d MMMM yyyy", { locale: fr });
  const periodLabel = PERIOD_LABELS[period];

  const decisions = entries.filter(e => e.entry_type === "decision");
  const milestones = entries.filter(e => e.entry_type === "milestone");
  const notes = entries.filter(e => e.entry_type === "note" || e.entry_type === "reflection");
  const withImpact = entries.filter(e => e.impact_measured?.summary);
  const withoutImpact = decisions.filter(e => !e.impact_measured?.summary);

  const entryRows = entries.map(entry => {
    const typeLabel = TYPE_LABELS[entry.entry_type] || entry.entry_type;
    const dateFormatted = format(new Date(entry.created_at), "d MMM yyyy", { locale: fr });
    const impactStatus = entry.impact_measured?.summary
      ? `<span style="color:#16a34a;font-weight:600;">✓ Mesuré</span>`
      : `<span style="color:#d97706;">◷ En attente</span>`;
    const impactDetail = entry.impact_measured?.summary
      ? `<div style="margin-top:6px;padding:8px 12px;background:#f0fdf4;border-left:3px solid #16a34a;border-radius:4px;font-size:11px;color:#15803d;">${escapeHtml(entry.impact_measured.summary)}</div>`
      : "";
    const tags = entry.tags.length > 0
      ? `<div style="margin-top:4px;">${entry.tags.map(t => `<span style="display:inline-block;background:#f1f5f9;color:#64748b;font-size:9px;padding:2px 6px;border-radius:3px;margin-right:4px;">${escapeHtml(t)}</span>`).join("")}</div>`
      : "";

    return `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 8px;vertical-align:top;width:90px;">
          <div style="font-size:11px;color:#64748b;">${dateFormatted}</div>
          <div style="font-size:10px;margin-top:2px;"><span style="background:${typeColor(entry.entry_type)};color:white;padding:2px 6px;border-radius:3px;font-size:9px;">${typeLabel}</span></div>
        </td>
        <td style="padding:12px 8px;vertical-align:top;">
          <div style="font-weight:600;font-size:13px;color:#1e293b;">${escapeHtml(entry.title)}</div>
          ${entry.content ? `<div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.5;">${escapeHtml(entry.content).substring(0, 300)}${entry.content.length > 300 ? "…" : ""}</div>` : ""}
          ${tags}
          ${impactDetail}
        </td>
        <td style="padding:12px 8px;vertical-align:top;width:100px;text-align:center;font-size:11px;">
          ${impactStatus}
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Journal Présidentiel — EMOTIONSCARE SASU</title>
  <style>
    @page { size: A4; margin: 20mm 18mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.5; }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f172a;padding-bottom:16px;margin-bottom:24px;">
    <div>
      <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">JOURNAL PRÉSIDENTIEL</h1>
      <p style="font-size:13px;color:#64748b;margin-top:4px;">EMOTIONSCARE SASU — Conseil d'Administration</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:12px;color:#64748b;">Document généré le</p>
      <p style="font-size:14px;font-weight:600;">${dateStr}</p>
      <p style="font-size:11px;color:#0284c7;margin-top:2px;font-weight:600;">Période : ${periodLabel}</p>
      <p style="font-size:10px;color:#94a3b8;margin-top:4px;">CONFIDENTIEL</p>
    </div>
  </div>

  <!-- Summary -->
  <div style="display:flex;gap:16px;margin-bottom:24px;">
    <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:24px;font-weight:700;color:#0f172a;">${entries.length}</div>
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Entrées totales</div>
    </div>
    <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:24px;font-weight:700;color:#16a34a;">${decisions.length}</div>
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Décisions</div>
    </div>
    <div style="flex:1;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:24px;font-weight:700;color:#d97706;">${withoutImpact.length}</div>
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Impact en attente</div>
    </div>
    <div style="flex:1;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:24px;font-weight:700;color:#0284c7;">${withImpact.length}</div>
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Impact mesuré</div>
    </div>
  </div>

  <!-- Entries table -->
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <thead>
      <tr style="border-bottom:2px solid #0f172a;">
        <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Date</th>
        <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Contenu</th>
        <th style="padding:8px;text-align:center;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Impact</th>
      </tr>
    </thead>
    <tbody>
      ${entryRows}
    </tbody>
  </table>

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;">
    <span>EMOTIONSCARE SASU — Document confidentiel réservé au Conseil d'Administration</span>
    <span>Page 1</span>
  </div>
</body>
</html>`;
}

function typeColor(type: string): string {
  switch (type) {
    case "decision": return "#6366f1";
    case "milestone": return "#16a34a";
    case "note": return "#64748b";
    case "reflection": return "#d97706";
    default: return "#64748b";
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
