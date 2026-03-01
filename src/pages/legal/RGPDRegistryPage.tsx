import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { COMPANY_PROFILE } from "@/lib/constants";
import { Shield, Database, Clock, Lock, Download, UserCheck, AlertTriangle } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
const dataProcessingActivities = [
  {
    name: "Authentification utilisateurs",
    purpose: "Gestion des accès et sessions",
    legalBasis: "Exécution du contrat",
    dataTypes: "Email, mot de passe hashé, timestamps connexion",
    retention: "Durée du compte + 3 ans",
    recipients: "Interne uniquement",
    security: "Chiffrement AES-256, JWT, bcrypt",
  },
  {
    name: "Briefings exécutifs IA",
    purpose: "Génération de rapports automatisés",
    legalBasis: "Intérêt légitime",
    dataTypes: "Données agrégées plateformes (non nominatives)",
    retention: "12 mois glissants",
    recipients: "Interne + Lovable AI Gateway (sous-traitant)",
    security: "Pas de PII transmis aux modèles IA",
  },
  {
    name: "Monitoring plateformes",
    purpose: "Surveillance technique et uptime",
    legalBasis: "Intérêt légitime",
    dataTypes: "Métriques techniques (latence, uptime, erreurs)",
    retention: "6 mois",
    recipients: "Interne uniquement",
    security: "Logs anonymisés",
  },
  {
    name: "Audit et conformité",
    purpose: "Traçabilité des actions",
    legalBasis: "Obligation légale",
    dataTypes: "Actions utilisateur, timestamps, IP",
    retention: "5 ans (obligation légale)",
    recipients: "Interne + autorités si requis",
    security: "Logs immuables, chiffrement at-rest",
  },
  {
    name: "Synchronisation GitHub",
    purpose: "Suivi des développements",
    legalBasis: "Intérêt légitime",
    dataTypes: "Commits, issues, PRs (données publiques)",
    retention: "3 mois cache",
    recipients: "GitHub API",
    security: "Token d'accès sécurisé",
  },
];

const subProcessors = [
  {
    name: "Lovable Cloud",
    location: "UE (Allemagne/Irlande)",
    purpose: "Hébergement application et Edge Functions",
    dpa: "Oui",
    scc: "N/A (UE)",
  },
  {
    name: "Supabase",
    location: "UE (Allemagne)",
    purpose: "Base de données et authentification",
    dpa: "Oui",
    scc: "N/A (UE)",
  },
  {
    name: "GitHub",
    location: "USA (SCCs)",
    purpose: "Synchronisation code source",
    dpa: "Oui",
    scc: "Oui",
  },
  {
    name: "Perplexity AI",
    location: "USA (SCCs)",
    purpose: "Veille stratégique (optionnel)",
    dpa: "Oui",
    scc: "Oui",
  },
];

export default function RGPDRegistryPage() {
  usePageMeta({
    title: "Registre des Traitements RGPD",
    description: `Registre des activités de traitement (Article 30 RGPD) d'${COMPANY_PROFILE.legalName}. Transparence sur la collecte et le traitement des données.`,
    noindex: true,
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Badge variant="subtle" className="mb-4 gap-2">
              <Shield className="h-3 w-3" />
              Conformité RGPD
            </Badge>
            <h1 className="text-headline-1 mb-4">Registre des Traitements</h1>
            <p className="text-muted-foreground text-lg">
              Article 30 du RGPD — Registre des activités de traitement de {COMPANY_PROFILE.legalName}
            </p>
          </div>
        </div>
      </section>

      {/* Responsable du traitement */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Responsable du traitement
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Raison sociale</p>
                  <p className="font-medium">{COMPANY_PROFILE.legalName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SIRET</p>
                  <p className="font-medium font-mono">{COMPANY_PROFILE.siret}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{COMPANY_PROFILE.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DPO / Contact</p>
                  <p className="font-medium">{COMPANY_PROFILE.president} (Présidente)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registre des traitements */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-headline-2 mb-6 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Activités de traitement
            </h2>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Traitement</TableHead>
                    <TableHead>Finalité</TableHead>
                    <TableHead>Base légale</TableHead>
                    <TableHead>Données</TableHead>
                    <TableHead>Conservation</TableHead>
                    <TableHead>Sécurité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataProcessingActivities.map((activity) => (
                    <TableRow key={activity.name}>
                      <TableCell className="font-medium">{activity.name}</TableCell>
                      <TableCell className="text-sm">{activity.purpose}</TableCell>
                      <TableCell>
                        <Badge variant="subtle" className="text-xs">
                          {activity.legalBasis}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                        {activity.dataTypes}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.retention}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="flex items-center gap-1 text-success">
                          <Lock className="h-3 w-3" />
                          {activity.security.split(",")[0]}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>

      {/* Sous-traitants */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-headline-2 mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Sous-traitants (Article 28)
            </h2>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sous-traitant</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Finalité</TableHead>
                    <TableHead>DPA</TableHead>
                    <TableHead>SCCs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subProcessors.map((sp) => (
                    <TableRow key={sp.name}>
                      <TableCell className="font-medium">{sp.name}</TableCell>
                      <TableCell>{sp.location}</TableCell>
                      <TableCell className="text-sm">{sp.purpose}</TableCell>
                      <TableCell>
                        <Badge variant={sp.dpa === "Oui" ? "gold" : "subtle"}>
                          {sp.dpa}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="subtle">{sp.scc}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>

      {/* Mesures de sécurité */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-headline-2 mb-6 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Mesures de sécurité (Article 32)
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sécurité technique</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Chiffrement TLS 1.3 en transit
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Chiffrement AES-256 au repos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Row Level Security (RLS) PostgreSQL
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Authentification JWT + bcrypt
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      RBAC granulaire (8 rôles)
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sécurité organisationnelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Audit log immuable
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Approval Gate pour actions critiques
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Panic Switch (arrêt d'urgence)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Principe du moindre privilège
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Revue de sécurité avant publication
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Droits des personnes */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-headline-2 mb-6">Droits des personnes concernées</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { right: "Accès", desc: "Obtenir copie de vos données", icon: Download },
                { right: "Rectification", desc: "Corriger données inexactes", icon: UserCheck },
                { right: "Effacement", desc: "Suppression des données", icon: AlertTriangle },
                { right: "Limitation", desc: "Restreindre le traitement", icon: Lock },
                { right: "Portabilité", desc: "Export format structuré", icon: Download },
                { right: "Opposition", desc: "Refuser certains traitements", icon: Shield },
              ].map((item) => (
                <Card key={item.right}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.right}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <p className="mt-6 text-sm text-muted-foreground">
              Pour exercer vos droits : contact via la page dédiée ou directement auprès de {COMPANY_PROFILE.president}.
              Délai de réponse : 30 jours maximum.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center text-sm text-muted-foreground">
            <p>Registre mis à jour le 03/02/2026 — Version 1.0</p>
            <p className="mt-2">
              Autorité de contrôle : CNIL — 3 Place de Fontenoy, 75007 Paris
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
