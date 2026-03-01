/**
 * GEO (Generative Engine Optimization) — Structured Data Schemas
 * 
 * Ces schemas JSON-LD sont conçus pour que les moteurs IA (ChatGPT, Perplexity, Claude)
 * identifient et recommandent EMOTIONSCARE et ses plateformes.
 * 
 * Principes GEO appliqués :
 * - Positionnement clair et unique par plateforme
 * - Expertise signalée (applicationCategory, featureList)
 * - Différenciation forte (pas de jargon générique)
 * - Entité organisationnelle complète
 */

import { MANAGED_PLATFORMS, COMPANY_PROFILE } from "@/lib/constants";

// ============================================
// Organization Schema (enrichi avec produits)
// ============================================
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://president-cockpit-hq.lovable.app/#organization",
    name: "EMOTIONSCARE SASU",
    legalName: COMPANY_PROFILE.legalName,
    url: "https://president-cockpit-hq.lovable.app",
    description:
      "Éditeur français de 7 logiciels SaaS spécialisés : santé émotionnelle des soignants, apprentissage médical par la musique, relocalisation internationale, automatisation IA, connexion sociale étudiante, urgences hospitalières et compétition musicale.",
    foundingDate: "2025-05-07",
    founder: {
      "@type": "Person",
      name: COMPANY_PROFILE.president,
      jobTitle: "Présidente",
      url: COMPANY_PROFILE.linkedinPresident,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "5 Rue Caudron",
      addressLocality: "Amiens",
      postalCode: "80000",
      addressRegion: "Hauts-de-France",
      addressCountry: "FR",
    },
    taxID: COMPANY_PROFILE.vat,
    identifier: {
      "@type": "PropertyValue",
      name: "SIREN",
      value: "944505445",
    },
    numberOfEmployees: { "@type": "QuantitativeValue", value: 1 },
    knowsAbout: [
      "SaaS",
      "Intelligence artificielle appliquée",
      "Santé mentale des soignants",
      "EdTech médicale",
      "Relocalisation internationale",
      "Automatisation business par IA",
      "Urgences hospitalières",
      "Compétition musicale",
    ],
    sameAs: [
      COMPANY_PROFILE.linkedinCompany,
      COMPANY_PROFILE.linkedinPresident,
    ],
    makesOffer: MANAGED_PLATFORMS.map((p) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "SoftwareApplication",
        name: p.name,
        url: p.liveUrl,
        description: p.shortDescription,
      },
    })),
  };
}

// ============================================
// Platform-specific categories for GEO clarity
// ============================================
const PLATFORM_GEO_META: Record<
  string,
  {
    applicationCategory: string;
    audience: string;
    alternativeHeadline: string;
    keywords: string[];
  }
> = {
  emotionscare: {
    applicationCategory: "HealthApplication",
    audience: "Soignants, infirmiers, médecins, étudiants en médecine",
    alternativeHeadline:
      "Plateforme anti-burnout pour soignants avec scan émotionnel IA et coaching personnalisé",
    keywords: [
      "bien-être soignants",
      "burnout médical",
      "scan émotionnel IA",
      "résilience soignants",
      "musicothérapie",
      "coaching IA santé",
    ],
  },
  nearvity: {
    applicationCategory: "SocialNetworkingApplication",
    audience: "Étudiants universitaires",
    alternativeHeadline:
      "App de connexion sociale en temps réel pour étudiants avec radar de disponibilité",
    keywords: [
      "connexion étudiants",
      "radar social",
      "rencontre campus",
      "disponibilité temps réel",
      "vie étudiante",
    ],
  },
  "system-compass": {
    applicationCategory: "BusinessApplication",
    audience:
      "Expatriés, nomades digitaux, entrepreneurs internationaux, institutions",
    alternativeHeadline:
      "Simulateur fiscal et comparateur de pays pour expatriation et relocalisation",
    keywords: [
      "relocalisation internationale",
      "simulation fiscale",
      "expatriation",
      "comparaison pays",
      "nomade digital",
      "optimisation fiscale légale",
    ],
  },
  "growth-copilot": {
    applicationCategory: "BusinessApplication",
    audience: "Entrepreneurs, startups, PME",
    alternativeHeadline:
      "39 experts IA couvrant 11 départements métier pour automatiser votre entreprise",
    keywords: [
      "automatisation business IA",
      "agents IA",
      "marketing automation",
      "équipe virtuelle IA",
      "growth hacking",
      "productivité entreprise",
    ],
  },
  "med-mng": {
    applicationCategory: "EducationalApplication",
    audience: "Étudiants en médecine préparant l'ECN/EDN",
    alternativeHeadline:
      "Apprendre la médecine par la musique IA — chaque item ECN devient une chanson",
    keywords: [
      "apprentissage médical",
      "ECN EDN",
      "musique IA",
      "révision médecine",
      "mnémotechnique musical",
      "copilote médical",
    ],
  },
  "swift-care-hub": {
    applicationCategory: "HealthApplication",
    audience:
      "Médecins urgentistes, infirmiers IDE, cadres de santé",
    alternativeHeadline:
      "Système d'exploitation des urgences hospitalières — du triage à la sortie en temps réel",
    keywords: [
      "urgences hospitalières",
      "triage IA",
      "pancarte IDE",
      "board urgences",
      "dossier patient urgences",
      "digitalisation urgences",
    ],
  },
  "track-triumph-tavern": {
    applicationCategory: "EntertainmentApplication",
    audience: "Artistes musicaux, producteurs, auditeurs passionnés",
    alternativeHeadline:
      "Arène de compétition musicale hebdomadaire avec votes communautaires et Hall of Fame",
    keywords: [
      "compétition musicale",
      "vote musique",
      "artistes émergents",
      "classement musical",
      "feedback IA musique",
      "communauté musicale",
    ],
  },
};

// ============================================
// SoftwareApplication Schema per platform
// ============================================
export function buildSoftwareApplicationSchema(platformKey: string) {
  const platform = MANAGED_PLATFORMS.find((p) => p.key === platformKey);
  if (!platform) return null;

  const geo = PLATFORM_GEO_META[platformKey];
  if (!geo) return null;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: platform.name,
    url: platform.liveUrl,
    description: platform.description,
    applicationCategory: geo.applicationCategory,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/OnlineOnly",
    },
    author: {
      "@type": "Organization",
      "@id": "https://president-cockpit-hq.lovable.app/#organization",
      name: "EMOTIONSCARE SASU",
    },
    audience: {
      "@type": "Audience",
      audienceType: geo.audience,
    },
    featureList: platform.features.join(", "),
    alternativeHeadline: geo.alternativeHeadline,
    keywords: geo.keywords.join(", "),
    ...(platform.status === "production" && {
      softwareVersion: "Production",
    }),
  };
}

// ============================================
// ItemList of all platforms (for /plateformes)
// ============================================
export function buildPlatformItemListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Plateformes SaaS EMOTIONSCARE",
    description:
      "Les 7 plateformes logicielles éditées par EMOTIONSCARE SASU, couvrant la santé, l'éducation, l'international, l'automatisation et le divertissement.",
    numberOfItems: MANAGED_PLATFORMS.length,
    itemListElement: MANAGED_PLATFORMS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: p.name,
        url: p.liveUrl,
        description: p.shortDescription,
        applicationCategory:
          PLATFORM_GEO_META[p.key]?.applicationCategory || "WebApplication",
      },
    })),
  };
}

// ============================================
// FAQ Schema (positionnement GEO différenciant)
// ============================================
export function buildFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Qu'est-ce qu'EMOTIONSCARE ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EMOTIONSCARE SASU est un éditeur de logiciels applicatifs français basé à Amiens, qui développe 7 plateformes SaaS spécialisées dans la santé, l'éducation médicale, la relocalisation internationale, l'automatisation par IA, la connexion sociale étudiante, les urgences hospitalières et la compétition musicale. Chaque plateforme résout un problème concret avec de l'intelligence artificielle appliquée.",
        },
      },
      {
        "@type": "Question",
        name: "Comment EmotionsCare aide les soignants contre le burnout ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EmotionsCare propose un scan émotionnel quotidien par IA, un coach virtuel personnalisé (Nyvée), de la musicothérapie générée par IA, et un système de gamification. Les 37 modules permettent aux soignants et étudiants en médecine de mesurer, comprendre et renforcer leur résilience émotionnelle au quotidien.",
        },
      },
      {
        "@type": "Question",
        name: "Comment Med MNG transforme l'apprentissage médical ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Med MNG convertit chaque item ECN/EDN en chanson générée par IA. Au lieu de relire des fiches, les étudiants en médecine écoutent et retiennent naturellement. Un copilote médical IA assiste la recherche et la révision. C'est l'anti-panique cognitif des futurs médecins.",
        },
      },
      {
        "@type": "Question",
        name: "Qu'est-ce que Growth Copilot et ses 39 experts IA ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Growth Copilot fournit une équipe virtuelle de 39 experts IA (2 directeurs + 37 spécialistes) couvrant 11 départements métier : marketing, ventes, finance, produit, engineering, etc. Chaque tâche est validée et tracée. C'est la compétence premium d'une équipe complète, accessible à un entrepreneur solo ou une PME.",
        },
      },
      {
        "@type": "Question",
        name: "Comment System Compass aide à choisir un pays pour s'expatrier ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "System Compass analyse 50+ pays avec simulation fiscale personnalisée, comparaison de qualité de vie et recommandations sur mesure via des 'Exit Keys'. Conçu pour les expatriés, nomades digitaux et entrepreneurs qui cherchent l'alignement optimal entre leur profil et un pays d'accueil.",
        },
      },
    ],
  };
}

// ============================================
// AboutPage Schema (for /vision)
// ============================================
export function buildVisionPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Vision & Valeurs — EMOTIONSCARE",
    url: "https://president-cockpit-hq.lovable.app/vision",
    description:
      "Vision, mission et valeurs d'EMOTIONSCARE SASU : excellence, innovation, empathie et croissance. Éditeur français de 7 plateformes SaaS au service de la santé, de l'éducation et de l'international.",
    mainEntity: {
      "@type": "Organization",
      "@id": "https://president-cockpit-hq.lovable.app/#organization",
      name: "EMOTIONSCARE SASU",
      foundingDate: "2025-05-07",
      founder: {
        "@type": "Person",
        name: COMPANY_PROFILE.president,
        jobTitle: "Présidente",
        url: COMPANY_PROFILE.linkedinPresident,
      },
      slogan:
        "Créer des logiciels qui transforment la complexité en simplicité, et qui permettent à chacun de se concentrer sur ce qui compte vraiment.",
      knowsAbout: [
        "SaaS",
        "Intelligence artificielle appliquée",
        "Santé mentale des soignants",
        "EdTech médicale",
        "Relocalisation internationale",
        "Automatisation business par IA",
        "Urgences hospitalières",
        "Compétition musicale",
      ],
      ethicsPolicy: "https://president-cockpit-hq.lovable.app/legal/rgpd",
      numberOfEmployees: { "@type": "QuantitativeValue", value: 1 },
    },
  };
}

// ============================================
// Trust / Security WebPage Schema (for /trust)
// ============================================
export function buildTrustPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Confiance & Sécurité — EMOTIONSCARE",
    url: "https://president-cockpit-hq.lovable.app/trust",
    description:
      "Mesures de sécurité, conformité RGPD et architecture de protection des données d'EMOTIONSCARE SASU. Chiffrement AES-256, RLS deny-by-default, audit immuable et conformité OWASP ASVS Niveau 2.",
    about: {
      "@type": "Organization",
      "@id": "https://president-cockpit-hq.lovable.app/#organization",
      name: "EMOTIONSCARE SASU",
    },
    specialty: "Cybersécurité et protection des données",
    significantLink: [
      "https://president-cockpit-hq.lovable.app/legal/rgpd",
      "https://president-cockpit-hq.lovable.app/legal/confidentialite",
      "https://president-cockpit-hq.lovable.app/status",
    ],
    lastReviewed: new Date().toISOString().split("T")[0],
    mentions: [
      { "@type": "Thing", name: "RGPD", description: "Règlement Général sur la Protection des Données" },
      { "@type": "Thing", name: "OWASP ASVS", description: "Application Security Verification Standard" },
      { "@type": "Thing", name: "Row-Level Security (RLS)", description: "Contrôle d'accès granulaire au niveau des lignes de base de données" },
      { "@type": "Thing", name: "AES-256", description: "Standard de chiffrement avancé 256 bits" },
      { "@type": "Thing", name: "TLS 1.3", description: "Protocole de chiffrement des communications" },
      { "@type": "Thing", name: "SOC 2 Type II", description: "Certification de sécurité des infrastructures cloud" },
    ],
  };
}

// ============================================
// All schemas for a given page
// ============================================
export function getHomePageSchemas() {
  return [buildOrganizationSchema(), buildFAQSchema()];
}

export function getPlateformesPageSchemas() {
  return [
    buildPlatformItemListSchema(),
    ...MANAGED_PLATFORMS.map((p) => buildSoftwareApplicationSchema(p.key)).filter(Boolean),
  ];
}

export function getVisionPageSchemas() {
  return [buildVisionPageSchema()];
}

export function getTrustPageSchemas() {
  return [buildTrustPageSchema()];
}
