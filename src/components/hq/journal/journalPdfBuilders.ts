import type { JournalEntry } from "@/hooks/useJournal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type PeriodFilter = "all" | "month" | "quarter" | "year";

export const TYPE_LABELS: Record<string, string> = {
  decision: "Décision",
  note: "Note",
  milestone: "Jalon",
  reflection: "Réflexion",
};

export const PERIOD_LABELS: Record<PeriodFilter, string> = {
  all: "Tout",
  month: "Ce mois",
  quarter: "Ce trimestre",
  year: "Cette année",
};

export function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function typeColor(type: string): string {
  switch (type) {
    case "decision": return "#6366f1";
    case "milestone": return "#16a34a";
    case "note": return "#64748b";
    case "reflection": return "#d97706";
    default: return "#64748b";
  }
}

export function buildMonthlyChart(entries: JournalEntry[]): { label: string; total: number; decisions: number }[] {
  const map = new Map<string, { total: number; decisions: number }>();
  for (const e of entries) {
    const key = format(new Date(e.created_at), "yyyy-MM");
    const existing = map.get(key) || { total: 0, decisions: 0 };
    existing.total++;
    if (e.entry_type === "decision") existing.decisions++;
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({
      label: format(new Date(key + "-01"), "MMM yy", { locale: fr }),
      ...val,
    }));
}

export function buildImpactChart(entries: JournalEntry[]): { label: string; measured: number; pending: number }[] {
  const map = new Map<string, { measured: number; pending: number }>();
  for (const e of entries) {
    if (e.entry_type !== "decision") continue;
    const key = format(new Date(e.created_at), "yyyy-MM");
    const existing = map.get(key) || { measured: 0, pending: 0 };
    if (e.impact_measured?.summary) {
      existing.measured++;
    } else {
      existing.pending++;
    }
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({
      label: format(new Date(key + "-01"), "MMM yy", { locale: fr }),
      ...val,
    }));
}

export function buildEntryRows(entries: JournalEntry[]): string {
  return entries.map(entry => {
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
}

export function buildMonthlyChartSvg(monthlyData: ReturnType<typeof buildMonthlyChart>): string {
  if (monthlyData.length <= 1) return "";
  return `
  <div style="margin-bottom:24px;padding:16px;border:1px solid #e2e8f0;border-radius:8px;background:#fafafa;">
    <h3 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#0f172a;">Évolution des décisions par mois</h3>
    <svg viewBox="0 0 ${monthlyData.length * 60} 140" style="width:100%;height:120px;" xmlns="http://www.w3.org/2000/svg">
      ${monthlyData.map((d, i) => {
        const maxVal = Math.max(...monthlyData.map(m => m.total), 1);
        const barH = (d.decisions / maxVal) * 90;
        const totalH = (d.total / maxVal) * 90;
        const x = i * 60 + 10;
        return `
          <rect x="${x}" y="${100 - totalH}" width="20" height="${totalH}" rx="3" fill="#e2e8f0" />
          <rect x="${x}" y="${100 - barH}" width="20" height="${barH}" rx="3" fill="#6366f1" />
          <text x="${x + 10}" y="115" text-anchor="middle" style="font-size:9px;fill:#64748b;">${d.label}</text>
          <text x="${x + 10}" y="${98 - totalH}" text-anchor="middle" style="font-size:9px;fill:#0f172a;font-weight:600;">${d.total}</text>
        `;
      }).join("")}
    </svg>
    <div style="display:flex;gap:16px;margin-top:8px;font-size:10px;color:#64748b;">
      <span><span style="display:inline-block;width:10px;height:10px;background:#6366f1;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Décisions</span>
      <span><span style="display:inline-block;width:10px;height:10px;background:#e2e8f0;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Total entrées</span>
    </div>
  </div>`;
}

export function buildImpactChartSvg(impactData: ReturnType<typeof buildImpactChart>): string {
  if (impactData.length <= 1) return "";
  return `
  <div style="margin-bottom:24px;padding:16px;border:1px solid #e2e8f0;border-radius:8px;background:#fafafa;">
    <h3 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#0f172a;">Ratio impact mesuré vs en attente par mois</h3>
    <svg viewBox="0 0 ${impactData.length * 60} 140" style="width:100%;height:120px;" xmlns="http://www.w3.org/2000/svg">
      ${impactData.map((d, i) => {
        const maxVal = Math.max(...impactData.map(m => m.measured + m.pending), 1);
        const measuredH = (d.measured / maxVal) * 90;
        const pendingH = (d.pending / maxVal) * 90;
        const x = i * 60 + 10;
        return `
          <rect x="${x}" y="${100 - pendingH - measuredH}" width="20" height="${measuredH}" rx="3" fill="#16a34a" />
          <rect x="${x}" y="${100 - pendingH}" width="20" height="${pendingH}" rx="3" fill="#d97706" />
          <text x="${x + 10}" y="115" text-anchor="middle" style="font-size:9px;fill:#64748b;">${d.label}</text>
          <text x="${x + 10}" y="${96 - pendingH - measuredH}" text-anchor="middle" style="font-size:9px;fill:#0f172a;font-weight:600;">${d.measured + d.pending}</text>
        `;
      }).join("")}
    </svg>
    <div style="display:flex;gap:16px;margin-top:8px;font-size:10px;color:#64748b;">
      <span><span style="display:inline-block;width:10px;height:10px;background:#16a34a;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Impact mesuré</span>
      <span><span style="display:inline-block;width:10px;height:10px;background:#d97706;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>En attente</span>
    </div>
  </div>`;
}

export function buildPDFHtml(entries: JournalEntry[], period: PeriodFilter): string {
  const now = new Date();
  const dateStr = format(now, "d MMMM yyyy", { locale: fr });
  const periodLabel = PERIOD_LABELS[period];

  const decisions = entries.filter(e => e.entry_type === "decision");
  const withImpact = entries.filter(e => e.impact_measured?.summary);
  const withoutImpact = decisions.filter(e => !e.impact_measured?.summary);

  const monthlyData = buildMonthlyChart(entries);
  const impactData = buildImpactChart(entries);

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

  ${buildMonthlyChartSvg(monthlyData)}
  ${buildImpactChartSvg(impactData)}

  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <thead>
      <tr style="border-bottom:2px solid #0f172a;">
        <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Date</th>
        <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Contenu</th>
        <th style="padding:8px;text-align:center;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Impact</th>
      </tr>
    </thead>
    <tbody>
      ${buildEntryRows(entries)}
    </tbody>
  </table>

  <div style="margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;">
    <span>EMOTIONSCARE SASU — Document confidentiel réservé au Conseil d'Administration</span>
    <span>Page 1</span>
  </div>
</body>
</html>`;
}
