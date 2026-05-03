import jsPDF from "jspdf";
import type { StudioBlueprint, StudioOpportunity, BlueprintSection } from "./studio-types";

const MARGIN = 16;
const LINE = 5.5;

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function writeWrapped(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH = LINE): number {
  if (!text) return y;
  const lines = doc.splitTextToSize(text, maxW);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineH);
    doc.text(line, x, y);
    y += lineH;
  }
  return y;
}

function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(20, 24, 43);
  doc.rect(0, 0, w, 26, "F");
  doc.setTextColor(245, 158, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("EMOTIONSPHERE STUDIO", MARGIN, 11);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(title, MARGIN, 19);
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 200);
    doc.text(subtitle, MARGIN, 24);
  }
  doc.setTextColor(20, 20, 30);
}

function addFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 130);
    doc.text(`EmotionSphere Studio · EMOTIONSCARE SASU · Confidentiel`, MARGIN, h - 6);
    doc.text(`${i}/${pages}`, w - MARGIN, h - 6, { align: "right" });
  }
}

function sectionTitle(doc: jsPDF, label: string, y: number): number {
  y = ensureSpace(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 24, 43);
  doc.text(label, MARGIN, y);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 1.5, MARGIN + 30, y + 1.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 55);
  return y + 7;
}

function renderSection(doc: jsPDF, label: string, sec: BlueprintSection | undefined, y: number, maxW: number): number {
  if (!sec || (!sec.summary && !sec.bullets?.length && !sec.notes)) return y;
  y = sectionTitle(doc, label, y);
  if (sec.summary) y = writeWrapped(doc, sec.summary, MARGIN, y, maxW);
  if (sec.bullets?.length) {
    y += 1;
    for (const b of sec.bullets) {
      y = ensureSpace(doc, y, LINE);
      const lines = doc.splitTextToSize(`• ${b}`, maxW - 4);
      for (const l of lines) {
        y = ensureSpace(doc, y, LINE);
        doc.text(l, MARGIN + 2, y);
        y += LINE;
      }
    }
  }
  if (sec.notes) {
    y += 1;
    doc.setTextColor(110, 110, 130);
    y = writeWrapped(doc, sec.notes, MARGIN, y, maxW);
    doc.setTextColor(40, 40, 55);
  }
  return y + 4;
}

const SECTIONS: { key: keyof StudioBlueprint; label: string }[] = [
  { key: "problem", label: "1. Problème" },
  { key: "opportunity", label: "2. Opportunité" },
  { key: "solution", label: "3. Solution" },
  { key: "targets", label: "4. Cibles" },
  { key: "business_model", label: "5. Modèle économique" },
  { key: "partners", label: "6. Partenaires" },
  { key: "deployment_plan", label: "7. Plan de déploiement" },
  { key: "kpis", label: "8. KPIs" },
  { key: "risks", label: "9. Risques" },
  { key: "pitch", label: "10. Pitch" },
  { key: "emotionsphere_role", label: "11. Rôle EmotionSphere" },
  { key: "deal_recommendation", label: "12. Recommandation deal" },
];

export function downloadBlueprint360Pdf(bp: StudioBlueprint): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const maxW = w - MARGIN * 2;
  addHeader(doc, bp.title, `Blueprint 360° · v${bp.version} · statut : ${bp.status}`);
  let y = 34;
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 130);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, MARGIN, y);
  y += 6;
  doc.setTextColor(40, 40, 55);
  doc.setFontSize(9.5);
  for (const s of SECTIONS) {
    y = renderSection(doc, s.label, bp[s.key] as BlueprintSection, y, maxW);
  }
  addFooter(doc);
  doc.save(`Blueprint360_${slug(bp.title)}.pdf`);
}

export function downloadPitchPdf(bp: StudioBlueprint): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const maxW = w - MARGIN * 2;
  addHeader(doc, `Pitch — ${bp.title}`, `Synthèse présidentielle · ${new Date().toLocaleDateString("fr-FR")}`);
  let y = 36;
  y = renderSection(doc, "Problème", bp.problem, y, maxW);
  y = renderSection(doc, "Opportunité", bp.opportunity, y, maxW);
  y = renderSection(doc, "Notre solution", bp.solution, y, maxW);
  y = renderSection(doc, "Modèle économique", bp.business_model, y, maxW);
  y = renderSection(doc, "Pitch", bp.pitch, y, maxW);
  y = renderSection(doc, "Rôle EmotionSphere", bp.emotionsphere_role, y, maxW);
  addFooter(doc);
  doc.save(`Pitch_${slug(bp.title)}.pdf`);
}

export function downloadOpportunityPitchPdf(opp: StudioOpportunity): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const maxW = w - MARGIN * 2;
  addHeader(doc, opp.title, `Note d'opportunité · ${opp.domain ?? "Multi-domaines"}`);
  let y = 36;
  if (opp.problem_statement) y = renderSection(doc, "Problème", { summary: opp.problem_statement }, y, maxW);
  if (opp.description) y = renderSection(doc, "Contexte", { summary: opp.description }, y, maxW);
  if (opp.recommended_action) y = renderSection(doc, "Action recommandée", { summary: opp.recommended_action }, y, maxW);
  const scores = [
    opp.opportunity_score != null ? `Opportunité: ${opp.opportunity_score}/100` : null,
    opp.strategic_value_score != null ? `Valeur stratégique: ${opp.strategic_value_score}/100` : null,
    opp.execution_risk_score != null ? `Risque d'exécution: ${opp.execution_risk_score}/100` : null,
  ].filter(Boolean) as string[];
  if (scores.length) y = renderSection(doc, "Scores", { bullets: scores }, y, maxW);
  addFooter(doc);
  doc.save(`Opportunite_${slug(opp.title)}.pdf`);
}

function slug(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 50) || "document";
}