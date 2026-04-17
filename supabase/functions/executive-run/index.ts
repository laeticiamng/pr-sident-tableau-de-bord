import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { getRunCostEstimate } from "../_shared/run-cost-estimates.ts";
import {
  callAIGatewayOrFallback,
  BreakerOpenError,
  getBreakerSnapshot,
} from "../_shared/ai-gateway.ts";

// Model router configuration
const MODEL_CONFIG = {
  default: "google/gemini-3-flash-preview",
  reasoning: "google/gemini-2.5-pro",
  coding: "openai/gpt-5.2",
  summary: "google/gemini-2.5-flash",
};

// Les 7 plateformes (registre immuable)
const MANAGED_REPOS = [
  { key: "emotionscare", repo: "laeticiamng/emotionscare" },
  { key: "nearvity", repo: "laeticiamng/nearvity" },
  { key: "system-compass", repo: "laeticiamng/system-compass" },
  { key: "growth-copilot", repo: "laeticiamng/growth-copilot" },
  { key: "med-mng", repo: "laeticiamng/med-mng" },
  { key: "swift-care-hub", repo: "laeticiamng/swift-care-hub" },
  { key: "track-triumph-tavern", repo: "laeticiamng/track-triumph-tavern" },
];

// Run type configurations with system prompts
const RUN_TEMPLATES: Record<string, { 
  systemPrompt: string; 
  model: keyof typeof MODEL_CONFIG;
  steps: string[];
  useGitHub?: boolean;
  usePerplexity?: boolean;
  useFirecrawl?: boolean;
  useStripe?: boolean;
}> = {
  DAILY_EXECUTIVE_BRIEF: {
    systemPrompt: `Tu es le Directeur Général (CEO Agent) d'EMOTIONSCARE SASU, éditeur de logiciels applicatifs français de premier plan.
Tu génères le briefing exécutif quotidien pour la Présidente avec les données RÉELLES des systèmes.

Structure ton rapport ainsi:
1. 🎯 RÉSUMÉ EXÉCUTIF (3 phrases max, impact business)
2. 📊 STATUT RAG DES PLATEFORMES (basé sur GitHub + monitoring réels)
   - Commits récents, issues ouvertes, PRs en attente
   - Uptime et performance
3. ⚡ TOP 3 PRIORITÉS DU JOUR
4. ⏳ DÉCISIONS EN ATTENTE D'APPROBATION
5. 🚨 ALERTES CRITIQUES (si applicable)
6. 📈 VEILLE STRATÉGIQUE (insights du marché)

Ton : professionnel, direct, factuel. Standard HEC/Polytechnique.
Ne jamais inventer de données - indique "Données non disponibles" si nécessaire.`,
    model: "reasoning",
    steps: ["Sync GitHub", "Collecte métriques", "Veille marché", "Synthèse exécutive", "Recommandations"],
    useGitHub: true,
    usePerplexity: true,
  },
  CEO_STANDUP_MEETING: {
    systemPrompt: `Tu es le Directeur Général (CEO Agent) conduisant le standup quotidien.
Génère un compte-rendu de réunion structuré avec données réelles:
1. ✅ Points clés par plateforme (basé sur GitHub)
2. 🔄 PRs et issues à traiter
3. 📋 Décisions prises
4. 🎯 Actions à suivre avec responsables
5. 📅 Prochaine réunion

Sois concis et orienté action.`,
    model: "default",
    steps: ["Sync GitHub", "Tour de table", "Synthèse", "Plan d'action"],
    useGitHub: true,
  },
  PLATFORM_STATUS_REVIEW: {
    systemPrompt: `Tu es le Directeur de Plateforme analysant l'état d'une plateforme avec données RÉELLES.
Génère un rapport de statut basé sur les données GitHub et monitoring:
1. 🚦 STATUT GLOBAL (RAG) avec justification factuelle
2. 📊 MÉTRIQUES (commits, issues, PRs, uptime)
3. 🐛 INCIDENTS en cours ou récents
4. 🚀 RELEASES planifiées/récentes
5. ⚠️ RISQUES identifiés
6. 💡 RECOMMANDATIONS

Base-toi UNIQUEMENT sur les données fournies.`,
    model: "summary",
    steps: ["Fetch GitHub data", "Analyse métriques", "Évaluation risques", "Rapport"],
    useGitHub: true,
  },
  SECURITY_AUDIT_RLS: {
    systemPrompt: `Tu es le CISO (Directeur Sécurité) effectuant un audit RLS complet.
Génère un rapport d'audit structuré:
1. 📋 TABLES ANALYSÉES
2. 🔒 POLITIQUES RLS en place
3. 🔴 VULNÉRABILITÉS potentielles détectées
4. ✅ CONFORMITÉ (OK/NOK par table)
5. 🛠️ RECOMMANDATIONS de remédiation prioritaires
6. 🎯 SCORE DE SÉCURITÉ GLOBAL (/100)

Adopte une approche rigoureuse et exhaustive de type audit Big4.`,
    model: "reasoning",
    steps: ["Scan tables", "Analyse politiques", "Détection vulnérabilités", "Benchmarking", "Rapport"],
    usePerplexity: true,
  },
  MARKETING_WEEK_PLAN: {
    systemPrompt: `Tu es le CMO (Directeur Marketing) planifiant la semaine marketing.
Génère un plan hebdomadaire basé sur la veille concurrentielle:
1. 🎯 OBJECTIFS de la semaine (SMART)
2. 📢 CAMPAGNES actives et résultats
3. ✍️ CONTENU à produire
4. 📱 CANAUX prioritaires
5. 💰 BUDGET alloué
6. 📊 KPIs à suivre
7. 🔍 INSIGHTS CONCURRENTIELS

Sois créatif mais data-driven avec les insights marché.`,
    model: "default",
    steps: ["Veille concurrentielle", "Revue objectifs", "Planning campagnes", "Allocation ressources"],
    usePerplexity: true,
    useFirecrawl: true,
  },
  RELEASE_GATE_CHECK: {
    systemPrompt: `Tu es le CTO effectuant une vérification de gate de release basée sur données GitHub RÉELLES.
Évalue la readiness d'une release:
1. ✅ CHECKLIST TECHNIQUE
   - Tests passés
   - Code review (basé sur PRs)
   - Documentation
2. 🔒 CHECKLIST SÉCURITÉ
   - Audit réalisé
   - Vulnérabilités connues
3. 📦 CHECKLIST PRODUIT
   - Specs validées
   - QA passée
4. ⚠️ RISQUES identifiés
5. 🚦 DÉCISION: GO / NO-GO / CONDITIONAL
6. 📋 CONDITIONS si applicable

Sois rigoureux et prudent - basé sur les données réelles.`,
    model: "reasoning",
    steps: ["Fetch GitHub PRs", "Revue technique", "Revue sécurité", "Décision"],
    useGitHub: true,
  },
  COMPETITIVE_ANALYSIS: {
    systemPrompt: `Tu es le Directeur Stratégie effectuant une analyse concurrentielle approfondie.
Utilise les données de veille pour générer:
1. 🏢 PROFIL DES CONCURRENTS identifiés
2. 💪 FORCES & FAIBLESSES de chacun
3. 📊 POSITIONNEMENT sur le marché
4. 🔧 TECHNOLOGIES utilisées
5. 📈 OPPORTUNITÉS pour EMOTIONSCARE
6. ⚔️ MENACES à surveiller
7. 🎯 RECOMMANDATIONS STRATÉGIQUES

Analyse rigoureuse basée sur les données collectées.`,
    model: "reasoning",
    steps: ["Scraping concurrents", "Recherche Perplexity", "Analyse SWOT", "Recommandations"],
    usePerplexity: true,
    useFirecrawl: true,
  },
  QUALITY_AUDIT: {
    systemPrompt: `Tu es le Directeur Qualité (QA Lead) effectuant un audit qualité complet des plateformes.
Génère un rapport d'audit qualité structuré:
1. 📋 PÉRIMÈTRE DE L'AUDIT
2. ✅ CONFORMITÉ CODE (standards, linting, typage)
3. 🧪 COUVERTURE TESTS (unitaires, intégration, E2E)
4. 📊 DETTE TECHNIQUE identifiée
5. 🔧 MAINTENABILITÉ et lisibilité du code
6. 📈 PERFORMANCE et optimisation
7. 🎯 SCORE QUALITÉ GLOBAL (/100)
8. 🛠️ PLAN DE REMÉDIATION priorisé

Sois rigoureux, factuel et orienté amélioration continue.`,
    model: "reasoning",
    steps: ["Analyse code", "Revue tests", "Évaluation dette technique", "Scoring", "Recommandations"],
    useGitHub: true,
  },
  ADS_PERFORMANCE_REVIEW: {
    systemPrompt: `Tu es le Directeur Marketing Digital (Head of Paid Acquisition) d'EMOTIONSCARE SASU.
Génère un rapport de performance publicitaire structuré:
1. 📊 VUE D'ENSEMBLE DES CAMPAGNES ACTIVES
2. 💰 BUDGET & DÉPENSES (par canal: Google Ads, LinkedIn, Meta)
3. 📈 KPIs CLÉS (CTR, CPC, CPA, ROAS)
4. 🎯 PERFORMANCE PAR AUDIENCE / SEGMENT
5. 🔄 TESTS A/B EN COURS ET RÉSULTATS
6. ⚠️ ALERTES (budgets dépassés, performances en baisse)
7. 💡 RECOMMANDATIONS D'OPTIMISATION
8. 📅 PLAN D'ACTION SEMAINE SUIVANTE

Sois orienté données et ROI.`,
    model: "reasoning",
    steps: ["Collecte données ads", "Analyse performance", "Benchmarking", "Recommandations"],
    usePerplexity: true,
  },
  GROWTH_STRATEGY_REVIEW: {
    systemPrompt: `Tu es le Chief Growth Officer analysant la stratégie de croissance d'EMOTIONSCARE SASU.
1. 🎯 BILAN CROISSANCE (acquisition, rétention, monétisation)
2. 📊 MÉTRIQUES CLÉS (CAC, LTV, taux de conversion)
3. 🚀 LEVIERS DE CROISSANCE activés/à activer
4. 📈 TENDANCES et projections
5. 💡 RECOMMANDATIONS STRATÉGIQUES`,
    model: "reasoning",
    steps: ["Analyse métriques", "Évaluation leviers", "Projections", "Recommandations"],
    usePerplexity: true,
  },
  OKR_QUARTERLY_REVIEW: {
    systemPrompt: `Tu es le CGO effectuant la revue trimestrielle des OKR d'EMOTIONSCARE SASU.
1. 🎯 STATUT DES OBJECTIFS (O1-On)
2. 📊 KEY RESULTS: progression vs cibles
3. ✅ RÉALISATIONS clés du trimestre
4. ⚠️ OBJECTIFS À RISQUE
5. 🔄 AJUSTEMENTS proposés pour le prochain trimestre`,
    model: "reasoning",
    steps: ["Collecte OKR", "Évaluation progression", "Analyse écarts", "Recommandations"],
    useGitHub: true,
  },
  COMPLIANCE_RGPD_CHECK: {
    systemPrompt: `Tu es le QCO vérifiant la conformité RGPD d'EMOTIONSCARE SASU.
1. 📋 REGISTRE DES TRAITEMENTS
2. 🔒 BASES LÉGALES vérifiées
3. 👤 DROITS DES PERSONNES (accès, suppression, portabilité)
4. 📊 AIPD requises/réalisées
5. ⚠️ NON-CONFORMITÉS détectées
6. 🛠️ PLAN DE REMÉDIATION`,
    model: "reasoning",
    steps: ["Inventaire traitements", "Vérification bases légales", "Audit droits", "Rapport"],
    usePerplexity: true,
  },
  SEO_AUDIT: {
    systemPrompt: `Tu es le Stratégiste SEO d'EMOTIONSCARE SASU.
1. 📊 POSITIONNEMENT ACTUEL (mots-clés principaux)
2. 🔍 ANALYSE TECHNIQUE (Core Web Vitals, indexation)
3. ✍️ CONTENU (qualité, maillage, opportunités)
4. 🔗 BACKLINKS et autorité de domaine
5. 📈 OPPORTUNITÉS DE CROISSANCE SEO
6. 🎯 PLAN D'ACTION priorisé`,
    model: "reasoning",
    steps: ["Audit technique", "Analyse contenu", "Analyse backlinks", "Recommandations"],
    usePerplexity: true,
    useFirecrawl: true,
  },
  CONTENT_CALENDAR_PLAN: {
    systemPrompt: `Tu es le Responsable Contenu planifiant le calendrier éditorial d'EMOTIONSCARE SASU.
1. 📅 CALENDRIER ÉDITORIAL (2 semaines)
2. ✍️ SUJETS prioritaires par plateforme
3. 📱 DISTRIBUTION par canal (blog, LinkedIn, newsletter)
4. 🎯 OBJECTIFS par contenu (SEO, lead gen, thought leadership)
5. 📊 MÉTRIQUES DE SUIVI`,
    model: "default",
    steps: ["Analyse tendances", "Planification sujets", "Attribution canaux", "Calendrier"],
    usePerplexity: true,
  },
  REVENUE_FORECAST: {
    systemPrompt: `Tu es le Directeur Commercial projetant les revenus d'EMOTIONSCARE SASU.
1. 💰 REVENUS ACTUELS (MRR, ARR par plateforme)
2. 📊 PIPELINE COMMERCIAL (deals en cours, probabilités)
3. 📈 PROJECTIONS à 3/6/12 mois
4. 🎯 OBJECTIFS vs RÉALISÉ
5. ⚠️ RISQUES sur le forecast
6. 💡 LEVIERS D'ACCÉLÉRATION`,
    model: "reasoning",
    steps: ["Collecte Stripe", "Analyse pipeline", "Modélisation", "Projections"],
    useStripe: true,
  },
  LEAD_SCORING_UPDATE: {
    systemPrompt: `Tu es le Qualificateur de Leads d'EMOTIONSCARE SASU.
1. 📊 LEADS ENTRANTS (volume, sources)
2. 🎯 SCORING: critères et pondération
3. 🔥 HOT LEADS à contacter en priorité
4. 📈 TAUX DE CONVERSION par source
5. 💡 RECOMMANDATIONS d'optimisation du scoring`,
    model: "default",
    steps: ["Collecte leads", "Application scoring", "Priorisation", "Rapport"],
    usePerplexity: true,
  },
  FINANCIAL_REPORT: {
    systemPrompt: `Tu es le DAF IA générant un rapport financier structuré pour EMOTIONSCARE SASU.
1. 💰 CHIFFRES CLÉS (MRR, ARR, Churn rate)
2. 📊 ÉVOLUTION VS PÉRIODE PRÉCÉDENTE
3. 🎯 ATTEINTE DES OBJECTIFS FINANCIERS
4. ⚠️ ALERTES (burn rate, runway, écarts)
5. 📈 PRÉVISIONS à 3 mois
6. 💡 RECOMMANDATIONS BUDGÉTAIRES`,
    model: "reasoning",
    steps: ["Fetch Stripe data", "Calcul KPIs", "Analyse tendances", "Rapport"],
    useStripe: true,
  },
  RGPD_AUDIT: {
    systemPrompt: `Tu es le Responsable Conformité auditant la conformité RGPD d'EMOTIONSCARE SASU.
1. 📋 ÉTAT DES TRAITEMENTS DE DONNÉES
2. 🔒 MESURES DE SÉCURITÉ en place
3. 📄 DOCUMENTATION (registre, AIPD, contrats)
4. 👤 GESTION DES DROITS (exercice effectif)
5. ⚠️ ÉCARTS DE CONFORMITÉ
6. 🛠️ ACTIONS CORRECTIVES prioritaires`,
    model: "reasoning",
    steps: ["Inventaire traitements", "Audit mesures", "Vérification droits", "Rapport"],
    usePerplexity: true,
  },
  VULNERABILITY_SCAN: {
    systemPrompt: `Tu es l'Auditeur Sécurité scannant les vulnérabilités des plateformes EMOTIONSCARE.
1. 🔍 PÉRIMÈTRE DU SCAN
2. 🔴 VULNÉRABILITÉS CRITIQUES
3. 🟠 VULNÉRABILITÉS HAUTES
4. 🟡 VULNÉRABILITÉS MOYENNES
5. ✅ POINTS CONFORMES
6. 🛠️ PLAN DE REMÉDIATION par priorité`,
    model: "reasoning",
    steps: ["Scan dépendances", "Analyse config", "Tests sécurité", "Rapport"],
    useGitHub: true,
  },
  ROADMAP_UPDATE: {
    systemPrompt: `Tu es le CPO IA mettant à jour la roadmap produit d'EMOTIONSCARE SASU.
1. 🎯 VISION PRODUIT (rappel)
2. ✅ LIVRABLES RÉCENTS
3. 📋 BACKLOG PRIORISÉ (next 3 mois)
4. 🚀 FEATURES EN DÉVELOPPEMENT
5. 📊 MÉTRIQUES D'ADOPTION
6. 🔄 AJUSTEMENTS DE PRIORITÉ`,
    model: "reasoning",
    steps: ["Revue livrables", "Analyse backlog", "Priorisation", "Mise à jour roadmap"],
    useGitHub: true,
  },
  CODE_REVIEW: {
    systemPrompt: `Tu es le Lead Developer effectuant une revue de code des plateformes EMOTIONSCARE.
1. 📊 MÉTRIQUES CODE (lignes, complexité, duplication)
2. ✅ BONNES PRATIQUES respectées
3. ⚠️ CODE SMELLS détectés
4. 🐛 BUGS POTENTIELS
5. 📈 DETTE TECHNIQUE évaluée
6. 🛠️ RECOMMANDATIONS par priorité`,
    model: "reasoning",
    steps: ["Analyse code", "Détection patterns", "Évaluation dette", "Recommandations"],
    useGitHub: true,
  },
  DEPLOYMENT_CHECK: {
    systemPrompt: `Tu es l'Ingénieur DevOps vérifiant l'état des déploiements EMOTIONSCARE.
1. 🚀 STATUT DES DÉPLOIEMENTS (par plateforme)
2. ✅ PIPELINES CI/CD (santé)
3. 📊 MÉTRIQUES (temps de build, taux de succès)
4. ⚠️ DÉPLOIEMENTS EN ÉCHEC
5. 🔄 ROLLBACKS récents
6. 💡 OPTIMISATIONS PROPOSÉES`,
    model: "default",
    steps: ["Check pipelines", "Analyse métriques", "Évaluation risques", "Rapport"],
    useGitHub: true,
  },
  DATA_INSIGHTS_REPORT: {
    systemPrompt: `Tu es le Data Analyst générant un rapport d'insights pour EMOTIONSCARE SASU.
1. 📊 MÉTRIQUES CLÉS (utilisateurs, engagement, conversion)
2. 📈 TENDANCES observées
3. 🔍 SEGMENTS performants/sous-performants
4. 💡 INSIGHTS ACTIONABLES
5. 🎯 RECOMMANDATIONS data-driven`,
    model: "reasoning",
    steps: ["Collecte données", "Analyse segments", "Détection tendances", "Insights"],
    usePerplexity: true,
  },
  AGENT_PERFORMANCE_REVIEW: {
    systemPrompt: `Tu es le Head of People IA évaluant la performance des 39 agents IA EMOTIONSCARE.
1. 📊 MÉTRIQUES GLOBALES (runs exécutés, taux de succès)
2. 🏆 TOP PERFORMERS (agents les plus actifs/efficaces)
3. ⚠️ AGENTS SOUS-PERFORMANTS
4. 💰 COÛT IA par agent/département
5. 📈 TENDANCES D'UTILISATION
6. 💡 RECOMMANDATIONS (modèles, prompts, réaffectations)`,
    model: "reasoning",
    steps: ["Collecte métriques", "Analyse performance", "Évaluation coûts", "Recommandations"],
    useGitHub: true,
  },
  TECH_WATCH_REPORT: {
    systemPrompt: `Tu es le Head of Innovation réalisant une veille technologique pour EMOTIONSCARE SASU.
1. 🔬 INNOVATIONS MAJEURES (IA, cloud, santé digitale)
2. 📊 TENDANCES DU MARCHÉ
3. 🛠️ TECHNOLOGIES ÉMERGENTES pertinentes
4. 💡 OPPORTUNITÉS D'APPLICATION pour nos plateformes
5. ⚠️ MENACES TECHNOLOGIQUES
6. 🎯 RECOMMANDATIONS R&D`,
    model: "reasoning",
    steps: ["Veille IA/tech", "Analyse tendances", "Évaluation opportunités", "Rapport"],
    usePerplexity: true,
    useFirecrawl: true,
  },
  DEPLOY_TO_PRODUCTION: {
    systemPrompt: `Tu es le CTO vérifiant la readiness d'un déploiement en production pour EMOTIONSCARE SASU.
⚠️ ACTION CRITIQUE — Ce run génère un rapport de vérification pré-déploiement.
1. ✅ CHECKLIST PRÉ-DÉPLOIEMENT (tests, migrations, rollback plan)
2. 🔒 VÉRIFICATION SÉCURITÉ (secrets, RLS, endpoints)
3. 📊 IMPACT ESTIMÉ (downtime, utilisateurs affectés)
4. ⚠️ RISQUES IDENTIFIÉS
5. 🚦 DÉCISION: GO / NO-GO / CONDITIONNEL
6. 📋 PLAN DE ROLLBACK si échec

Sois extrêmement prudent et rigoureux. Aucun déploiement sans checklist complète.`,
    model: "reasoning",
    steps: ["Vérification pré-deploy", "Audit sécurité", "Analyse risques", "Décision GO/NO-GO"],
    useGitHub: true,
  },
  RLS_POLICY_UPDATE: {
    systemPrompt: `Tu es le CISO analysant une modification de politique RLS pour EMOTIONSCARE SASU.
⚠️ ACTION CRITIQUE — Modification des règles d'accès aux données.
1. 📋 POLITIQUE ACTUELLE (table, règles en place)
2. 🔄 MODIFICATION PROPOSÉE
3. 🔒 ANALYSE D'IMPACT SÉCURITÉ
4. ⚠️ RISQUES (exposition données, permissions excessives)
5. ✅ VALIDATION ou ❌ REJET avec justification
6. 🛠️ RECOMMANDATIONS ALTERNATIVES si rejet

Approche audit Big4 — zéro tolérance sur l'exposition de données.`,
    model: "reasoning",
    steps: ["Analyse politique actuelle", "Évaluation modification", "Analyse impact", "Décision"],
    useGitHub: true,
  },
  MASS_EMAIL_CAMPAIGN: {
    systemPrompt: `Tu es le CMO planifiant une campagne email de masse pour EMOTIONSCARE SASU.
1. 🎯 OBJECTIF DE LA CAMPAGNE
2. 👥 SEGMENTS CIBLÉS (taille, critères)
3. ✍️ CONTENU PROPOSÉ (objet, aperçu, CTA)
4. 📊 MÉTRIQUES ATTENDUES (taux d'ouverture, CTR, conversion)
5. ⚠️ CONFORMITÉ RGPD (consentement, désinscription)
6. 📅 PLANNING D'ENVOI (horaire optimal, A/B test)
7. 💰 COÛT ESTIMÉ

Sois orienté performance et conformité RGPD.`,
    model: "default",
    steps: ["Définition cible", "Création contenu", "Vérification RGPD", "Planification envoi"],
    usePerplexity: true,
  },
  PRICING_CHANGE: {
    systemPrompt: `Tu es le CFO analysant un changement de tarification pour EMOTIONSCARE SASU.
⚠️ ACTION SENSIBLE — Impact direct sur le revenu.
1. 💰 TARIFICATION ACTUELLE (par plateforme/plan)
2. 🔄 MODIFICATION PROPOSÉE
3. 📊 IMPACT FINANCIER ESTIMÉ (MRR, ARR, churn potentiel)
4. 📈 ANALYSE ÉLASTICITÉ PRIX
5. ⚠️ RISQUES (perte clients, perception marché)
6. 🎯 RECOMMANDATION (approuver / ajuster / rejeter)
7. 📋 PLAN DE COMMUNICATION si approuvé

Analyse rigoureuse orientée P&L et rétention.`,
    model: "reasoning",
    steps: ["Analyse tarification actuelle", "Modélisation impact", "Analyse risques", "Recommandation"],
    useStripe: true,
  },
};

// Helper function to fetch GitHub data
async function fetchGitHubData(token: string | undefined, platformKey?: string): Promise<string> {
  if (!token) {
    return "GitHub non connecté - token manquant";
  }

  const repos = platformKey 
    ? MANAGED_REPOS.filter(r => r.key === platformKey)
    : MANAGED_REPOS;

  let contextData = "\n\n📊 DONNÉES GITHUB RÉELLES:\n";

  for (const { key, repo } of repos) {
    try {
      // Fetch commits
      const commitsRes = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "EMOTIONSCARE-HQ" },
      });
      const commits = commitsRes.ok ? await commitsRes.json() : [];

      // Fetch open issues
      const issuesRes = await fetch(`https://api.github.com/repos/${repo}/issues?state=open&per_page=10`, {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "EMOTIONSCARE-HQ" },
      });
      const issues = issuesRes.ok ? (await issuesRes.json()).filter((i: any) => !i.pull_request) : [];

      // Fetch open PRs
      const prsRes = await fetch(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=10`, {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "EMOTIONSCARE-HQ" },
      });
      const prs = prsRes.ok ? await prsRes.json() : [];

      contextData += `\n📁 ${key.toUpperCase()}\n`;
      contextData += `   Issues ouvertes: ${issues.length}\n`;
      contextData += `   PRs en attente: ${prs.length}\n`;
      
      if (commits.length > 0) {
        contextData += `   Dernier commit: ${commits[0]?.commit?.message?.split('\n')[0] || 'N/A'} (${commits[0]?.commit?.author?.date?.split('T')[0] || 'N/A'})\n`;
      }
      
      if (issues.length > 0) {
        contextData += `   Issues récentes: ${issues.slice(0, 3).map((i: any) => `#${i.number}: ${i.title}`).join(', ')}\n`;
      }
    } catch (e) {
      contextData += `\n📁 ${key.toUpperCase()}: Erreur de récupération\n`;
    }
  }

  return contextData;
}

// Helper function to fetch Perplexity intelligence
async function fetchPerplexityData(apiKey: string | undefined, query: string): Promise<string> {
  if (!apiKey) {
    return "\n\n🔍 VEILLE STRATÉGIQUE: Perplexity non configuré";
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "Tu es un analyste de veille stratégique. Réponds en français, de manière concise et factuelle." },
          { role: "user", content: query },
        ],
        search_recency_filter: "week",
      }),
    });

    if (!response.ok) {
      return "\n\n🔍 VEILLE STRATÉGIQUE: Erreur API Perplexity";
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    return `\n\n🔍 VEILLE STRATÉGIQUE (Perplexity):\n${content}\n\n📎 Sources: ${citations.slice(0, 3).join(", ") || "N/A"}`;
  } catch (e) {
    return "\n\n🔍 VEILLE STRATÉGIQUE: Erreur de connexion";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("[Executive Run] LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.error("[Executive Run] Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Executive Run] Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a client with the user's token to verify authentication
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("[Executive Run] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    // userId authenticated

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user has owner role using the has_role RPC function
    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError) {
      console.error("[Executive Run] Role check error:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Erreur de vérification des permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasOwnerRole) {
      console.error(`[Executive Run] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // owner role verified
    // ============================================
    // END AUTHENTICATION CHECK
    // ============================================

    // Rate limit: 30 requests per 5 minutes per user
    const rl = checkRateLimit(`executive-run:${userId}`, { maxRequests: 30, windowMs: 5 * 60 * 1000 });
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const { run_type, platform_key, context_data } = await req.json();

    console.log(`[Executive Run] Starting ${run_type}${platform_key ? ` for ${platform_key}` : ""}`);

    const template = RUN_TEMPLATES[run_type];
    if (!template) {
      // Log unknown run type attempt
      const { error: unknownLogErr } = await supabaseAdmin.rpc("insert_hq_log", {
        p_level: "warn",
        p_source: "executive-run",
        p_message: `Unknown run type attempted: ${run_type}`,
        p_metadata: { run_type, platform_key, user_id: userId },
      });
      if (unknownLogErr) console.error("[Executive Run] Log insert error:", unknownLogErr.message);
      
      return new Response(
        JSON.stringify({ error: `Unknown run type: ${run_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const model = MODEL_CONFIG[template.model];
    const startTime = Date.now();

    const costEstimate = getRunCostEstimate(run_type);

    // Log run start
    const { error: startLogErr } = await supabaseAdmin.rpc("insert_hq_log", {
      p_level: "info",
      p_source: "executive-run",
      p_message: `run.started`,
      p_metadata: { run_type, platform_key, model, user_id: userId, cost_estimate: costEstimate },
    });
    if (startLogErr) console.error("[Executive Run] Log insert error:", startLogErr.message);

    // Build rich context from multiple sources
    let additionalContext = "";

    // Fetch GitHub data if needed
    if (template.useGitHub) {
      console.log("[Executive Run] Fetching GitHub data...");
      additionalContext += await fetchGitHubData(GITHUB_TOKEN, platform_key);
    }

    // Fetch platform data from DB
    if (platform_key) {
      const { data: platform } = await supabaseAdmin.rpc("get_hq_platform", { 
        platform_key_param: platform_key 
      });
      if (platform) {
        additionalContext += `\n\n📋 DONNÉES PLATEFORME:\nNom: ${platform.name || platform_key}\nStatut: ${platform.status?.toUpperCase() || "INCONNU"}\nUptime: ${platform.uptime_percent || "N/A"}%`;
      }
    }

    // Fetch all platforms for executive brief
    if (run_type === "DAILY_EXECUTIVE_BRIEF") {
      const { data: platforms } = await supabaseAdmin.rpc("get_all_hq_platforms");
      if (platforms && Array.isArray(platforms)) {
        additionalContext += `\n\n📋 STATUT BASE DE DONNÉES:\n`;
        platforms.forEach((p: any) => {
          additionalContext += `- ${p.name}: ${p.status?.toUpperCase() || "INCONNU"} (${p.status_reason || "-"}) - Uptime: ${p.uptime_percent || "N/A"}%\n`;
        });
      }
    }

    // Fetch Perplexity intelligence if needed
    if (template.usePerplexity) {
      console.log("[Executive Run] Fetching Perplexity intelligence...");
      const searchQuery = run_type === "DAILY_EXECUTIVE_BRIEF"
        ? "Actualités et tendances du marché des logiciels applicatifs en France cette semaine. No-code, IA, plateformes."
        : run_type === "MARKETING_WEEK_PLAN"
        ? "Stratégies marketing digital efficaces pour éditeurs de logiciels B2B en 2025. Tendances, canaux, exemples."
        : run_type === "COMPETITIVE_ANALYSIS"
        ? "Principaux éditeurs de logiciels applicatifs français. Analyse concurrentielle, positionnement, forces."
        : "Actualités tech et software en France";
      
      additionalContext += await fetchPerplexityData(PERPLEXITY_API_KEY, searchQuery);
    }

    // Add custom context
    if (context_data) {
      additionalContext += `\n\nContexte supplémentaire:\n${JSON.stringify(context_data, null, 2)}`;
    }

    // model already defined above

    const userPrompt = `📅 Date: ${new Date().toLocaleDateString("fr-FR", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}

🏢 Entreprise: EMOTIONSCARE SASU — Éditeur de logiciels applicatifs
📍 Siège: Amiens, France
💼 7 Plateformes managées: EmotionsCare, NEARVITY, System Compass, Growth Copilot, Med MNG, UrgenceOS, Track Triumph

Type de run: ${run_type}
${additionalContext}

Génère le rapport demandé en français avec les données RÉELLES fournies ci-dessus.`;

    console.log(`[Executive Run] Calling AI model: ${model}`);

    // Fallback gracieux si circuit-breaker OPEN : message d'indisponibilité plutôt qu'erreur 500
    const fallbackMessage = `⚠️ **Service IA temporairement indisponible**

Le moteur d'IA exécutif est en mode dégradé suite à des défaillances répétées du gateway. Le circuit-breaker est actif pour préserver la stabilité du système.

**Run demandé** : ${run_type}${platform_key ? `\n**Plateforme** : ${platform_key}` : ""}
**Action recommandée** : Réessayez dans 1 à 2 minutes. Si le problème persiste, consultez le panneau Diagnostics.

_Ce message est généré automatiquement par le circuit-breaker, aucune charge IA n'a été facturée._`;

    let aiResult;
    try {
      aiResult = await callAIGatewayOrFallback(
        {
          apiKey: LOVABLE_API_KEY,
          model,
          messages: [
            { role: "system", content: template.systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          maxTokens: 3000,
        },
        fallbackMessage
      );
    } catch (gatewayErr) {
      const status = (gatewayErr as Error & { status?: number }).status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA insuffisants. Contactez l'administrateur." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw gatewayErr;
    }

    const executiveSummary = aiResult.content || "Rapport non généré";
    const breakerSnap = getBreakerSnapshot("ai-gateway:lovable");

    console.log(
      `[Executive Run] AI response: ${executiveSummary.length} chars (fallback=${aiResult.fallback_used}, breaker=${aiResult.breaker_state})`
    );

    const runResult = {
      success: true,
      run_id: crypto.randomUUID(),
      run_type,
      platform_key,
      executive_summary: executiveSummary,
      steps: template.steps,
      model_used: aiResult.model,
      fallback_used: aiResult.fallback_used,
      breaker_state: aiResult.breaker_state,
      data_sources: [
        template.useGitHub ? "GitHub API" : null,
        template.usePerplexity ? "Perplexity AI" : null,
        template.useFirecrawl ? "Firecrawl" : null,
        aiResult.fallback_used ? "Fallback (breaker OPEN)" : "Lovable AI Gateway",
      ].filter(Boolean),
      completed_at: new Date().toISOString(),
    };

    const durationMs = Date.now() - startTime;
    console.log(`[Executive Run] Completed in ${durationMs}ms with sources: ${runResult.data_sources.join(", ")}`);

    // Log run completion (avec info breaker)
    const { error: completeLogErr } = await supabaseAdmin.rpc("insert_hq_log", {
      p_level: aiResult.fallback_used ? "warn" : "info",
      p_source: "executive-run",
      p_message: aiResult.fallback_used ? "run.completed.fallback" : "run.completed",
      p_metadata: {
        run_type,
        platform_key,
        model: aiResult.model,
        duration_ms: durationMs,
        run_id: runResult.run_id,
        cost_estimate: aiResult.fallback_used ? 0 : costEstimate,
        breaker_state: aiResult.breaker_state,
        breaker_snapshot: breakerSnap,
      },
    });
    if (completeLogErr) console.error("[Executive Run] Log insert error:", completeLogErr.message);

    // Persist run in hq.runs table (uses user's JWT for RLS / is_owner check)
    const { data: persistedRunId, error: persistErr } = await supabaseAuth.rpc("insert_hq_run", {
      p_run_type: run_type,
      p_platform_key: platform_key || null,
      p_owner_requested: true,
      p_status: aiResult.fallback_used ? "failed" : "completed",
      p_executive_summary: executiveSummary.substring(0, 10000),
      p_detailed_appendix: {
        model_used: aiResult.model,
        data_sources: runResult.data_sources,
        duration_ms: durationMs,
        cost_estimate: aiResult.fallback_used ? 0 : costEstimate,
        steps: template.steps,
        fallback_used: aiResult.fallback_used,
        breaker_state: aiResult.breaker_state,
      },
    });
    if (persistErr) {
      console.error("[Executive Run] Run persist error:", persistErr.message);
    } else {
      runResult.run_id = persistedRunId;
    }

    return new Response(
      JSON.stringify(runResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Executive Run] Unexpected error:", error);

    // Try to log the error (best-effort, supabaseAdmin may not be available)
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await adminClient.rpc("insert_hq_log", {
          p_level: "error",
          p_source: "executive-run",
          p_message: `run.failed`,
          p_metadata: { error_message: error instanceof Error ? error.message : String(error), error_stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : undefined },
        });
      }
    } catch (_) { /* best-effort */ }

    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
