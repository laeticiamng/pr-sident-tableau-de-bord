import { Badge } from "@/components/ui/badge";
import { Users, Building2 } from "lucide-react";

const executiveTeam = [
  { role: "CEO_AGENT", title: "Directeur Général", name: "CEO Agent", status: "active" },
  { role: "COO_AGENT", title: "Directeur des Opérations", name: "COO Agent", status: "active" },
  { role: "CPO_AGENT", title: "Directeur Produit", name: "CPO Agent", status: "active" },
  { role: "CTO_AGENT", title: "Directeur Technique", name: "CTO Agent", status: "active" },
  { role: "CISO_AGENT", title: "Directeur Sécurité", name: "CISO Agent", status: "active" },
  { role: "CFO_AGENT", title: "Directeur Financier", name: "CFO Agent", status: "active" },
  { role: "CMO_AGENT", title: "Directeur Marketing", name: "CMO Agent", status: "active" },
  { role: "CRO_AGENT", title: "Directeur Commercial", name: "CRO Agent", status: "active" },
  { role: "CIO_AGENT", title: "Directeur SI", name: "CIO Agent", status: "active" },
  { role: "GC_AGENT", title: "Directeur Juridique", name: "GC Agent", status: "active" },
];

const functionHeads = [
  { role: "HEAD_ENGINEERING_PLATFORM_AGENT", title: "Responsable Engineering", status: "active" },
  { role: "HEAD_QA_AGENT", title: "Responsable QA", status: "active" },
  { role: "HEAD_DATA_AGENT", title: "Responsable Data", status: "active" },
  { role: "HEAD_DESIGN_AGENT", title: "Responsable Design", status: "active" },
  { role: "HEAD_SUPPORT_AGENT", title: "Responsable Support", status: "active" },
  { role: "HEAD_PEOPLE_AGENT", title: "Responsable RH Agents", status: "active" },
];

const platformDirectors = [
  { role: "GM_EMOTIONSCARE", title: "DG EmotionsCare", platform: "emotionscare", status: "active" },
  { role: "GM_PIXEL_PERFECT_REPLICA", title: "DG Pixel Perfect", platform: "pixel-perfect-replica", status: "active" },
  { role: "GM_SYSTEM_COMPASS", title: "DG System Compass", platform: "system-compass", status: "active" },
  { role: "GM_GROWTH_COPILOT", title: "DG Growth Copilot", platform: "growth-copilot", status: "active" },
  { role: "GM_MED_MNG", title: "DG Med MNG", platform: "med-mng", status: "active" },
];

export default function EquipeExecutivePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Équipe Executive</h1>
        <p className="text-muted-foreground text-lg">
          Organigramme complet des directeurs et agents du siège.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold mb-1">{executiveTeam.length}</div>
          <div className="text-sm text-muted-foreground">Directeurs Exécutifs</div>
        </div>
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold mb-1">{functionHeads.length}</div>
          <div className="text-sm text-muted-foreground">Responsables Fonction</div>
        </div>
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold mb-1">{platformDirectors.length}</div>
          <div className="text-sm text-muted-foreground">Directeurs Plateforme</div>
        </div>
      </div>

      {/* C-Suite */}
      <div className="card-executive p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Comité Exécutif (C-Suite)</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {executiveTeam.map((member) => (
            <div key={member.role} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="gold" className="font-mono text-xs">{member.role}</Badge>
                <Badge variant="success" className="text-xs">Actif</Badge>
              </div>
              <h3 className="font-semibold">{member.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Function Heads */}
      <div className="card-executive p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Responsables de Fonction</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {functionHeads.map((member) => (
            <div key={member.role} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="subtle" className="font-mono text-xs">{member.role}</Badge>
                <Badge variant="success" className="text-xs">Actif</Badge>
              </div>
              <h3 className="font-semibold">{member.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Directors */}
      <div className="card-executive p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Directeurs Généraux Plateforme</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platformDirectors.map((member) => (
            <div key={member.role} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default" className="font-mono text-xs">{member.role}</Badge>
                <Badge variant="success" className="text-xs">Actif</Badge>
              </div>
              <h3 className="font-semibold">{member.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">Plateforme: {member.platform}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
