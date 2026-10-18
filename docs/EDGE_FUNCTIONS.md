# Documentation Backend — Edge Functions

> Spécifications détaillées des fonctions backend EMOTIONSCARE HQ

---

## Vue d'ensemble

| Fonction | Endpoint | Méthode | Authentification | Description |
|----------|----------|---------|------------------|-------------|
| `executive-run` | `/functions/v1/executive-run` | POST | JWT requis | Exécution des runs IA structurés |
| `github-sync` | `/functions/v1/github-sync` | POST | JWT requis | Synchronisation données GitHub |
| `intelligence-search` | `/functions/v1/intelligence-search` | POST | JWT requis | Recherche via Perplexity AI |
| `platform-analysis` | `/functions/v1/platform-analysis` | POST | JWT requis | Analyse IA complète d'une plateforme |
| `platform-monitor` | `/functions/v1/platform-monitor` | POST | JWT requis | Monitoring uptime des plateformes |
| `scheduled-runs` | `/functions/v1/scheduled-runs` | POST | CRON interne | Exécution planifiée automatique |
| `stripe-kpis` | `/functions/v1/stripe-kpis` | GET/POST | JWT requis | Récupération KPIs Stripe |
| `web-scraper` | `/functions/v1/web-scraper` | POST | JWT requis | Scraping via Firecrawl |

---

## 1. executive-run

### Description
Fonction centrale d'exécution des "runs" IA. Route les requêtes vers le modèle approprié et agrège les données de multiples sources.

### Endpoint
```
POST /functions/v1/executive-run
Authorization: Bearer <JWT>
Content-Type: application/json
```

### Payload
```typescript
{
  run_type: string;        // Type de run (voir RUN_TEMPLATES)
  platform_key?: string;   // Clé plateforme pour runs spécifiques
  context_data?: object;   // Contexte additionnel
}
```

### Types de run supportés
| Type | Description | Modèle | Sources |
|------|-------------|--------|---------|
| `DAILY_EXECUTIVE_BRIEF` | Briefing quotidien | gemini-2.5-pro | GitHub, Perplexity, DB |
| `CEO_STANDUP_MEETING` | Compte-rendu standup | gemini-3-flash | GitHub |
| `PLATFORM_STATUS_REVIEW` | Revue plateforme | gemini-2.5-flash | GitHub, DB |
| `SECURITY_AUDIT_RLS` | Audit RLS | gemini-2.5-pro | Perplexity |
| `MARKETING_WEEK_PLAN` | Plan marketing | gemini-3-flash | Perplexity, Firecrawl |
| `RELEASE_GATE_CHECK` | Validation release | gemini-2.5-pro | GitHub |
| `COMPETITIVE_ANALYSIS` | Analyse concurrentielle | gemini-2.5-pro | Perplexity, Firecrawl |

### Réponse
```typescript
{
  success: boolean;
  run_id: string;
  run_type: string;
  platform_key?: string;
  executive_summary: string;
  steps: string[];
  model_used: string;
  data_sources: string[];
  completed_at: string;
}
```

### Erreurs
| Code | Description |
|------|-------------|
| 400 | Type de run inconnu |
| 402 | Crédits IA insuffisants |
| 429 | Rate limit atteint |
| 500 | Erreur interne |

### Secrets requis
- `LOVABLE_API_KEY` (obligatoire)
- `GITHUB_TOKEN` (optionnel)
- `PERPLEXITY_API_KEY` (optionnel)

---

## 2. github-sync

### Description
Synchronise les données des 5 dépôts GitHub managés : commits, issues, PRs, branches.

### Endpoint
```
POST /functions/v1/github-sync
Authorization: Bearer <JWT>
```

### Payload
```typescript
{
  platform_key?: string;   // Si absent, sync tous les repos
  full_sync?: boolean;     // Sync complet vs incrémental
}
```

### Réponse
```typescript
{
  success: boolean;
  platforms: Array<{
    key: string;
    commits: number;
    open_issues: number;
    open_prs: number;
    last_commit_date: string;
  }>;
  synced_at: string;
}
```

### Dépôts gérés
```typescript
const MANAGED_REPOS = [
  { key: "emotionscare", repo: "laeticiamng/emotionscare" },
  { key: "pixel-perfect-replica", repo: "laeticiamng/pixel-perfect-replica" },
  { key: "system-compass", repo: "laeticiamng/system-compass" },
  { key: "growth-copilot", repo: "laeticiamng/growth-copilot" },
  { key: "med-mng", repo: "laeticiamng/med-mng" },
];
```

### Secrets requis
- `GITHUB_TOKEN` (obligatoire)

---

## 3. intelligence-search

### Description
Interface avec Perplexity AI pour recherche stratégique et veille concurrentielle.

### Endpoint
```
POST /functions/v1/intelligence-search
Authorization: Bearer <JWT>
```

### Payload
```typescript
{
  query: string;           // Question de recherche
  recency?: string;        // "day" | "week" | "month"
  search_domain?: string;  // Domaine spécifique
}
```

### Réponse
```typescript
{
  success: boolean;
  content: string;
  citations: string[];
  model: string;
  tokens_used: number;
}
```

### Secrets requis
- `PERPLEXITY_API_KEY` (obligatoire)

---

## 4. platform-monitor

### Description
Vérifie l'uptime et la latence des 5 plateformes via health checks HTTP.

### Endpoint
```
POST /functions/v1/platform-monitor
Authorization: Bearer <JWT>
```

### Payload
```typescript
{
  platform_key?: string;   // Si absent, check toutes
}
```

### Réponse
```typescript
{
  success: boolean;
  platforms: Array<{
    key: string;
    status: "green" | "amber" | "red";
    response_time_ms: number;
    error?: string;
  }>;
  checked_at: string;
}
```

### Logique de statut
- 🟢 Green: Réponse < 1000ms, HTTP 2xx
- 🟡 Amber: Réponse 1000-3000ms OU HTTP 5xx
- 🔴 Red: Timeout > 5s OU erreur réseau

---

## 5. scheduled-runs

### Description
Exécute les runs planifiés via CRON. Invoquée par pg_cron.

### Endpoint
```
POST /functions/v1/scheduled-runs
Authorization: Internal CRON
```

### CRON Jobs configurés
| Schedule | Type | Description |
|----------|------|-------------|
| `0 7 * * 1-5` | DAILY_EXECUTIVE_BRIEF | Lun-Ven 7h |
| `0 9 * * 1` | PLATFORM_STATUS_REVIEW | Lundi 9h |
| `0 8 1 * *` | SECURITY_AUDIT_RLS | 1er du mois |
| `0 10 * * 5` | MARKETING_WEEK_PLAN | Vendredi 10h |
| `0 14 15 * *` | COMPETITIVE_ANALYSIS | 15 du mois |

### Logique d'approbation
- Risque LOW : Auto-exécution
- Risque MEDIUM/HIGH : Création action en attente d'approbation

---

## 6. stripe-kpis

### Description
Récupère les KPIs financiers depuis l'API Stripe.

### Endpoint
```
GET /functions/v1/stripe-kpis
Authorization: Bearer <JWT>
```

### Réponse
```typescript
{
  success: boolean;
  kpis: {
    mrr: number;
    active_subscriptions: number;
    churn_rate: number;
    revenue_30d: number;
    new_customers_30d: number;
  };
  fetched_at: string;
}
```

### Secrets requis
- `STRIPE_SECRET_KEY` (obligatoire)

---

## 7. web-scraper

### Description
Scraping de pages web via Firecrawl pour analyse concurrentielle.

### Endpoint
```
POST /functions/v1/web-scraper
Authorization: Bearer <JWT>
```

### Payload
```typescript
{
  url: string;             // URL à scraper
  formats?: string[];      // ["markdown", "html", "screenshot"]
}
```

### Réponse
```typescript
{
  success: boolean;
  content: string;
  title?: string;
  screenshot_url?: string;
}
```

### Secrets requis
- `FIRECRAWL_API_KEY` (obligatoire)

---

## Sécurité

### Authentification
Toutes les fonctions (sauf `scheduled-runs`) requièrent un JWT valide :
```
Authorization: Bearer <supabase_access_token>
```

### Rate Limiting
| Fonction | Limite |
|----------|--------|
| executive-run | 10/heure |
| github-sync | 20/heure |
| intelligence-search | 30/heure |
| platform-monitor | 60/heure |
| stripe-kpis | 30/heure |
| web-scraper | 10/heure |

### Logging
Chaque appel est loggé avec :
- Timestamp
- User ID
- Function name
- Duration
- Status code
- Error (si applicable)

---

## Timeouts et fallbacks

| Fonction | Timeout | Fallback |
|----------|---------|----------|
| executive-run | 30s | Réponse partielle avec données disponibles |
| github-sync | 20s | Cache des dernières données |
| intelligence-search | 15s | Message "Recherche indisponible" |
| platform-analysis | 60s | Analyse partielle (GitHub seul si scrape échoue) |
| platform-monitor | 10s | Status "unknown" |
| stripe-kpis | 10s | `available: false`, `kpis: null` (jamais de données simulées) |
| web-scraper | 30s | Erreur explicite |

---

## 9. platform-analysis

### Description
Analyse IA complète d'une plateforme combinant scraping du site web, données GitHub et génération de rapport par IA.

### Endpoint
```
POST /functions/v1/platform-analysis
Authorization: Bearer <JWT>
Content-Type: application/json
```

### Payload
```typescript
{
  platform_key: string;           // Clé de la plateforme (emotionscare, med-mng, etc.)
  analysis_type?: "full" | "quick"; // Type d'analyse (défaut: full)
}
```

### Sources de données
- **Site web** : Scraping via Firecrawl (markdown + liens)
- **GitHub** : Commits, issues, PRs, langages, README
- **IA** : Gemini 3 Flash pour génération du rapport

### Réponse
```typescript
{
  success: boolean;
  platform: {
    key: string;
    name: string;
    liveUrl: string;
    repo: string;
  };
  analyzed_at: string;
  website: {
    scraped: boolean;
    links_count: number;
    content_length: number;
    error?: string;
  };
  github: {
    stars: number;
    forks: number;
    languages: string[];
    issues_open: number;
    issues_closed: number;
    prs_open: number;
    prs_merged: number;
    last_push: string;
    recent_commits: Array<{
      sha: string;
      message: string;
      date: string;
      author: string;
    }>;
  };
  analysis: string;  // Rapport Markdown généré par IA
}
```

### Erreurs
| Code | Description |
|------|-------------|
| 400 | platform_key manquant ou invalide |
| 401 | Token JWT invalide |
| 403 | Rôle owner requis |
| 500 | Erreur interne |

### Secrets requis
- `LOVABLE_API_KEY` (obligatoire)
- `GITHUB_TOKEN` (obligatoire)
- `FIRECRAWL_API_KEY` (optionnel - analyse GitHub seul si absent)

---

*Dernière mise à jour: 04/02/2026 — v1.1*
