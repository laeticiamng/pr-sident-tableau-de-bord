import { usePageMeta } from "@/hooks/usePageMeta";
import { Shield, Lock, Eye, Server, FileCheck, ExternalLink, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const LAST_AUDIT_DATE = "28 février 2026";

const securityMeasures = [
  {
    icon: Lock,
    title: "Chiffrement des données",
    description: "Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Les clés de chiffrement sont gérées par une infrastructure certifiée SOC 2 Type II.",
  },
  {
    icon: Shield,
    title: "Contrôle d'accès granulaire",
    description: "Chaque table de la base de données est protégée par des politiques RLS (Row-Level Security). L'accès aux données sensibles est strictement réservé au propriétaire authentifié.",
  },
  {
    icon: Server,
    title: "Isolation des schémas",
    description: "Les données de gouvernance sont isolées dans un schéma dédié (séparation logique), empêchant tout accès croisé non autorisé entre les couches applicatives.",
  },
  {
    icon: Eye,
    title: "Audit et traçabilité",
    description: "Chaque action critique est enregistrée dans un journal d'audit immuable (append-only). Les logs incluent l'acteur, l'action, la ressource et l'horodatage.",
  },
  {
    icon: FileCheck,
    title: "Validation des entrées",
    description: "Toutes les données utilisateur sont validées côté serveur avec des schémas stricts. Les requêtes SQL sont paramétrées pour prévenir les injections.",
  },
  {
    icon: Lock,
    title: "Authentification renforcée",
    description: "Authentification JWT avec vérification de rôle sur chaque endpoint. Les fonctions backend vérifient l'identité et les permissions avant tout traitement.",
  },
];

const complianceItems = [
  {
    title: "Registre des traitements",
    description: "Registre RGPD complet et à jour, consultable en ligne.",
    link: "/legal/rgpd",
    linkLabel: "Consulter le registre",
  },
  {
    title: "Politique de confidentialité",
    description: "Transparence totale sur la collecte et l'utilisation des données.",
    link: "/legal/confidentialite",
    linkLabel: "Lire la politique",
  },
  {
    title: "Conditions générales",
    description: "Cadre contractuel clair pour l'utilisation de nos services.",
    link: "/legal/cgv",
    linkLabel: "Consulter les CGV",
  },
  {
    title: "Mentions légales",
    description: "Informations légales complètes sur l'éditeur.",
    link: "/legal/mentions",
    linkLabel: "Voir les mentions",
  },
];

const architecturePoints = [
  "27 tables protégées par des politiques RLS avec approche deny-by-default",
  "14 fonctions SECURITY DEFINER avec search_path fixe et vérification is_owner()",
  "12 fonctions backend avec validation JWT + vérification de rôle propriétaire",
  "Rate limiting sur les endpoints sensibles (cooldown 5 min)",
  "Comparaison en temps constant pour les secrets (protection timing attacks)",
  "Secrets API stockés exclusivement côté serveur (jamais exposés au client)",
  "Formulaire de contact protégé par un gatekeeper serveur (validation Zod + rate limiting IP)",
  "Tracking analytique anonyme par design (INSERT public, SELECT propriétaire uniquement)",
];

export default function TrustPage() {
  usePageMeta({
    title: "Confiance & Sécurité — EMOTIONSCARE",
    description: "Découvrez les mesures de sécurité, la conformité RGPD et l'architecture de protection des données d'EMOTIONSCARE.",
  });

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">
              Dernière vérification : {LAST_AUDIT_DATE}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Confiance & Sécurité
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            La protection de vos données est notre priorité absolue. 
            Voici comment nous sécurisons notre infrastructure et respectons vos droits.
          </p>
        </div>
      </section>

      {/* Security Measures */}
      <section className="pb-16 sm:pb-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Mesures de sécurité</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {securityMeasures.map((measure) => (
              <Card key={measure.title} className="card-executive">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <measure.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{measure.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {measure.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* Architecture */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Architecture de protection</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Notre infrastructure suit le principe de défense en profondeur avec des contrôles à chaque couche.
          </p>
          <Card className="card-executive">
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {architecturePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="mt-6 flex justify-center">
            <Badge variant="outline" className="gap-2 px-4 py-2">
              <Shield className="h-3.5 w-3.5" />
              Conforme OWASP ASVS Niveau 2
            </Badge>
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* RGPD Compliance */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Conformité RGPD</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Nous respectons pleinement le Règlement Général sur la Protection des Données.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {complianceItems.map((item) => (
              <Card key={item.title} className="card-executive">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {item.linkLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="pb-16 sm:pb-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
          <Card className="card-executive bg-secondary/30">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-semibold mb-2">Une question sur la sécurité ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Notre équipe est à votre disposition pour répondre à vos questions 
                sur la protection de vos données.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Contactez-nous
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
