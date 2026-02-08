import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Lock,
  Eye,
  Trash2,
  Download,
  Clock,
  Users
} from "lucide-react";
import { RGPDExportButton } from "@/components/hq/compliance/RGPDExportButton";
import { AIPDChecklist } from "@/components/hq/conformite/AIPDChecklist";
import { DocumentInventory } from "@/components/hq/conformite/DocumentInventory";
import { ComplianceAlerts } from "@/components/hq/conformite/ComplianceAlerts";

// RGPD Rights - Les 8 droits fondamentaux
const RGPD_RIGHTS = [
  { key: "information", name: "Droit à l'information", status: "compliant", icon: Eye },
  { key: "access", name: "Droit d'accès", status: "compliant", icon: FileText },
  { key: "rectification", name: "Droit de rectification", status: "compliant", icon: FileCheck },
  { key: "erasure", name: "Droit à l'effacement", status: "compliant", icon: Trash2 },
  { key: "restriction", name: "Droit à la limitation", status: "partial", icon: Lock },
  { key: "portability", name: "Droit à la portabilité", status: "compliant", icon: Download },
  { key: "opposition", name: "Droit d'opposition", status: "compliant", icon: AlertTriangle },
  { key: "automated", name: "Décisions automatisées", status: "partial", icon: Users },
];

// Documents de conformité
const COMPLIANCE_DOCS = [
  { name: "Politique de confidentialité", status: "published", lastUpdate: "2026-01-15" },
  { name: "Conditions Générales de Vente", status: "published", lastUpdate: "2026-01-15" },
  { name: "Mentions légales", status: "published", lastUpdate: "2026-01-10" },
  { name: "Registre des traitements", status: "draft", lastUpdate: "2026-01-20" },
  { name: "AIPD (Analyse d'impact)", status: "pending", lastUpdate: null },
  { name: "Politique de cookies", status: "published", lastUpdate: "2026-01-12" },
];

export default function ConformitePage() {
  const compliantCount = RGPD_RIGHTS.filter(r => r.status === "compliant").length;
  const complianceScore = (compliantCount / RGPD_RIGHTS.length) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Conformité & RGPD</h1>
        <p className="text-muted-foreground text-lg">
          Gestion de la conformité réglementaire et protection des données personnelles.
        </p>
      </div>

      {/* Score de conformité global */}
      <Card className="card-executive bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Score de Conformité RGPD</CardTitle>
                <CardDescription>
                  Évaluation globale de la conformité au Règlement Général sur la Protection des Données
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">{complianceScore.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">{compliantCount}/{RGPD_RIGHTS.length} droits</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={complianceScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Les 8 droits RGPD */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Les 8 Droits Fondamentaux
          </CardTitle>
          <CardDescription>
            Statut de conformité pour chaque droit garanti par le RGPD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {RGPD_RIGHTS.map(right => {
              const Icon = right.icon;
              return (
                <div
                  key={right.key}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">{right.name}</span>
                  </div>
                  <Badge 
                    variant={right.status === "compliant" ? "gold" : "subtle"}
                    className="text-xs"
                  >
                    {right.status === "compliant" ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> Conforme</>
                    ) : (
                      <><AlertTriangle className="h-3 w-3 mr-1" /> Partiel</>
                    )}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Documents de conformité */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documents de Conformité
          </CardTitle>
          <CardDescription>
            État des documents légaux et réglementaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {COMPLIANCE_DOCS.map(doc => (
              <div
                key={doc.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    {doc.lastUpdate && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Mis à jour le {new Date(doc.lastUpdate).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={
                    doc.status === "published" ? "gold" : 
                    doc.status === "draft" ? "subtle" : 
                    "secondary"
                  }
                  className="text-xs capitalize"
                >
                  {doc.status === "published" ? "Publié" : 
                   doc.status === "draft" ? "Brouillon" : 
                   "En attente"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AIPD Checklist */}
      <AIPDChecklist />

      {/* Compliance Alerts */}
      <ComplianceAlerts />

      {/* Document Inventory */}
      <DocumentInventory />

      <Separator />

      {/* Informations entreprise */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle>Responsable du Traitement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Raison sociale</p>
              <p className="font-medium">EMOTIONSCARE SASU</p>
            </div>
            <div>
              <p className="text-muted-foreground">SIREN</p>
              <p className="font-medium">944 505 445</p>
            </div>
            <div>
              <p className="text-muted-foreground">Siège social</p>
              <p className="font-medium">5 Rue Caudron, 80000 Amiens</p>
            </div>
            <div>
              <p className="text-muted-foreground">Présidente</p>
              <p className="font-medium">Motongane Laeticia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <RGPDExportButton />
        <Button 
          variant="outline"
          onClick={() => {
            window.open("mailto:contact@emotionscare.com?subject=Demande%20d%27audit%20RGPD", "_blank");
          }}
        >
          Demander un audit
        </Button>
      </div>
    </div>
  );
}
