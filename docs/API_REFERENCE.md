# API Reference — EMOTIONSCARE HQ

> Documentation complète des Edge Functions et endpoints du siège social numérique

---

## 📌 Vue d'ensemble

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/functions/v1/executive-run` | POST | ✅ JWT | Lancement de runs IA exécutifs |
| `/functions/v1/stripe-kpis` | GET | ✅ JWT | Récupération des KPIs Stripe |
| `/functions/v1/github-sync` | POST | ✅ JWT | Synchronisation des repos GitHub |
| `/functions/v1/platform-monitor` | POST | ✅ JWT | Monitoring uptime des plateformes |
| `/functions/v1/intelligence-search` | POST | ✅ JWT | Recherche intelligente Perplexity |
| `/functions/v1/web-scraper` | POST | ✅ JWT | Scraping web via Firecrawl |

**Base URL**: `https://hjoylhxakijxpihwrqny.supabase.co`

---

## 🔐 Authentification

Toutes les requêtes nécessitent un token JWT dans le header `Authorization`:

```bash
curl -X POST \
  'https://hjoylhxakijxpihwrqny.supabase.co/functions/v1/executive-run' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"run_type": "DAILY_EXECUTIVE_BRIEF"}'
```

Pour obtenir un token JWT:
```typescript
import { supabase } from "@/integrations/supabase/client";

const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

---

## 📊 Executive Run

Exécute un run IA avec données réelles (GitHub, Stripe, Perplexity).

### Endpoint

```
POST /functions/v1/executive-run
```

### Request Body

```json
{
  "run_type": "DAILY_EXECUTIVE_BRIEF",
  "platform_key": "emotionscare",
  "context_data": { "custom": "data" }
}
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `run_type` | string | ✅ | Type de run (voir liste ci-dessous) |
| `platform_key` | string | ❌ | Clé de plateforme cible |
| `context_data` | object | ❌ | Données contextuelles additionnelles |

### Types de Run

| Type | Description | Sources utilisées |
|------|-------------|-------------------|
| `DAILY_EXECUTIVE_BRIEF` | Briefing quotidien pour la Présidente | GitHub, Perplexity, DB |
| `CEO_STANDUP_MEETING` | Compte-rendu standup DG | GitHub |
| `PLATFORM_STATUS_REVIEW` | Revue statut d'une plateforme | GitHub, DB |
| `SECURITY_AUDIT_RLS` | Audit sécurité RLS complet | Perplexity |
| `MARKETING_WEEK_PLAN` | Plan marketing hebdomadaire | Perplexity, Firecrawl |
| `RELEASE_GATE_CHECK` | Vérification gate de release | GitHub |
| `COMPETITIVE_ANALYSIS` | Analyse concurrentielle | Perplexity, Firecrawl |

### Response (200 OK)

```json
{
  "success": true,
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "run_type": "DAILY_EXECUTIVE_BRIEF",
  "platform_key": null,
  "executive_summary": "# 🎯 Briefing Exécutif...\n\n## Résumé...",
  "steps": ["Sync GitHub", "Collecte métriques", "Veille marché", "Synthèse exécutive", "Recommandations"],
  "model_used": "google/gemini-2.5-pro",
  "data_sources": ["GitHub API", "Perplexity AI", "Lovable AI Gateway"],
  "completed_at": "2026-02-03T12:00:00.000Z"
}
```

### Errors

| Code | Description |
|------|-------------|
| `400` | Type de run invalide |
| `402` | Crédits IA insuffisants |
| `429` | Limite de requêtes atteinte |
| `500` | Erreur serveur |

### Exemple curl

```bash
curl -X POST \
  'https://hjoylhxakijxpihwrqny.supabase.co/functions/v1/executive-run' \
  -H 'Authorization: Bearer eyJhbGciOiJI...' \
  -H 'Content-Type: application/json' \
  -d '{
    "run_type": "PLATFORM_STATUS_REVIEW",
    "platform_key": "emotionscare"
  }'
```

---

## 💰 Stripe KPIs

Récupère les métriques financières depuis Stripe.

### Endpoint

```
GET /functions/v1/stripe-kpis
```

### Response (200 OK)

```json
{
  "success": true,
  "mock": false,
  "kpis": {
    "mrr": 12450.00,
    "mrrChange": 8.2,
    "activeSubscriptions": 247,
    "activeSubscriptionsChange": 12,
    "churnRate": 2.1,
    "churnRateChange": -0.3,
    "totalCustomers": 1247,
    "newCustomersThisMonth": 45,
    "revenueThisMonth": 15400.00,
    "revenueLastMonth": 14200.00,
    "currency": "eur",
    "lastUpdated": "2026-02-03T12:00:00.000Z"
  }
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `mock` | boolean | `true` si données simulées (STRIPE_SECRET_KEY manquant) |
| `mrr` | number | Monthly Recurring Revenue en € |
| `mrrChange` | number | Variation MRR en % vs mois précédent |
| `activeSubscriptions` | number | Abonnements actifs |
| `churnRate` | number | Taux de churn en % |
| `totalCustomers` | number | Nombre total de clients |
| `revenueThisMonth` | number | Revenus du mois en cours |
| `currency` | string | Code devise (ISO 4217) |

### Exemple TypeScript

```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke("stripe-kpis");

if (data?.success) {
  console.log(`MRR: ${data.kpis.mrr}€`);
  console.log(`Abonnés: ${data.kpis.activeSubscriptions}`);
}
```

---

## 🔄 GitHub Sync

Synchronise les données des repositories GitHub managés.

### Endpoint

```
POST /functions/v1/github-sync
```

### Request Body

```json
{
  "platform_key": "emotionscare"
}
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `platform_key` | string | ❌ | Clé plateforme (si absent: tous les repos) |

### Response (200 OK)

```json
{
  "success": true,
  "platforms": [
    {
      "key": "emotionscare",
      "commits_count": 5,
      "open_issues": 12,
      "open_prs": 3,
      "last_commit": "2026-02-03T10:30:00Z",
      "last_commit_message": "feat: add dashboard widgets"
    }
  ],
  "synced_at": "2026-02-03T12:00:00.000Z"
}
```

---

## 📡 Platform Monitor

Vérifie l'uptime et la latence des 5 plateformes.

### Endpoint

```
POST /functions/v1/platform-monitor
```

### Response (200 OK)

```json
{
  "success": true,
  "platforms": [
    {
      "key": "emotionscare",
      "status": "green",
      "response_time_ms": 245,
      "checked_at": "2026-02-03T12:00:00.000Z"
    },
    {
      "key": "med-mng",
      "status": "amber",
      "response_time_ms": 1200,
      "error": "Latence élevée",
      "checked_at": "2026-02-03T12:00:00.000Z"
    }
  ],
  "summary": {
    "total": 5,
    "green": 4,
    "amber": 1,
    "red": 0,
    "avg_response_time_ms": 380
  }
}
```

### Status Values

| Status | Signification | Critères |
|--------|---------------|----------|
| `green` | Opérationnel | Réponse < 500ms, HTTP 2xx |
| `amber` | Dégradé | Réponse 500-2000ms ou erreurs mineures |
| `red` | Critique | Réponse > 2000ms ou erreur HTTP |

---

## 🔍 Intelligence Search

Recherche stratégique via Perplexity AI.

### Endpoint

```
POST /functions/v1/intelligence-search
```

### Request Body

```json
{
  "query": "Tendances SaaS France 2026",
  "search_type": "market_intelligence"
}
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `query` | string | ✅ | Question de recherche |
| `search_type` | string | ❌ | Type: `market_intelligence`, `competitor`, `tech_trend` |

### Response (200 OK)

```json
{
  "success": true,
  "answer": "Les principales tendances SaaS en France pour 2026...",
  "citations": [
    "https://lesechos.fr/article/...",
    "https://maddyness.com/..."
  ],
  "model": "sonar-pro",
  "searched_at": "2026-02-03T12:00:00.000Z"
}
```

---

## 🕷️ Web Scraper

Scraping de pages web via Firecrawl.

### Endpoint

```
POST /functions/v1/web-scraper
```

### Request Body

```json
{
  "url": "https://example.com/page",
  "options": {
    "includeScreenshot": true,
    "waitFor": 2000
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "title": "Page Title",
  "content": "Extracted markdown content...",
  "screenshot_url": "https://storage.../screenshot.png",
  "scraped_at": "2026-02-03T12:00:00.000Z"
}
```

---

## 🗄️ Database RPC Functions

Les fonctions RPC sont accessibles via le client Supabase:

### `is_owner()`
Vérifie si l'utilisateur courant a le rôle `owner`.

```typescript
const { data: isOwner } = await supabase.rpc("is_owner");
// Returns: boolean
```

### `has_role(_user_id, _role)`
Vérifie si un utilisateur a un rôle spécifique.

```typescript
const { data: hasRole } = await supabase.rpc("has_role", {
  _user_id: userId,
  _role: "admin"
});
// Returns: boolean
```

### `has_permission(_user_id, _resource, _action)`
Vérifie une permission granulaire.

```typescript
const { data: canEdit } = await supabase.rpc("has_permission", {
  _user_id: userId,
  _resource: "finance",
  _action: "edit"
});
// Returns: boolean
```

### `get_user_permissions(_user_id)`
Récupère toutes les permissions d'un utilisateur.

```typescript
const { data: permissions } = await supabase.rpc("get_user_permissions", {
  _user_id: userId
});
// Returns: { resource: string, action: string }[]
```

### `get_hq_recent_runs(limit_count?)`
Récupère les runs IA récents.

```typescript
const { data: runs } = await supabase.rpc("get_hq_recent_runs", {
  limit_count: 10
});
```

### `get_hq_pending_actions()`
Récupère les actions en attente d'approbation.

```typescript
const { data: actions } = await supabase.rpc("get_hq_pending_actions");
```

### `approve_hq_action(p_action_id, p_decision, p_reason?)`
Approuve ou rejette une action.

```typescript
const { data: success } = await supabase.rpc("approve_hq_action", {
  p_action_id: actionId,
  p_decision: "approved", // or "rejected"
  p_reason: "Validé par la Présidente"
});
```

### `get_all_hq_platforms()`
Récupère le statut de toutes les plateformes.

```typescript
const { data: platforms } = await supabase.rpc("get_all_hq_platforms");
```

### `get_hq_agents()`
Récupère la liste des agents IA.

```typescript
const { data: agents } = await supabase.rpc("get_hq_agents");
```

### `get_hq_audit_logs(limit_count?)`
Récupère les logs d'audit.

```typescript
const { data: logs } = await supabase.rpc("get_hq_audit_logs", {
  limit_count: 50
});
```

---

## ⚠️ Codes d'erreur communs

| Code HTTP | Signification | Action |
|-----------|---------------|--------|
| `400` | Requête invalide | Vérifier les paramètres |
| `401` | Non authentifié | Obtenir un nouveau token JWT |
| `402` | Crédits insuffisants | Contacter l'administrateur |
| `403` | Accès refusé | Vérifier les permissions |
| `429` | Rate limit | Attendre et réessayer |
| `500` | Erreur serveur | Consulter les logs |

---

## 🔒 Secrets requis

| Secret | Edge Function | Description |
|--------|--------------|-------------|
| `LOVABLE_API_KEY` | executive-run | Gateway IA Lovable |
| `STRIPE_SECRET_KEY` | stripe-kpis | API Stripe (sk_live_...) |
| `GITHUB_TOKEN` | github-sync, executive-run | Personal Access Token GitHub |
| `PERPLEXITY_API_KEY` | intelligence-search, executive-run | API Perplexity |
| `FIRECRAWL_API_KEY` | web-scraper | API Firecrawl |

---

---

## 📦 Platform Registry Contract

Le registre `MANAGED_PLATFORMS` est la source de vérité pour les 10 plateformes gérées par EMOTIONSCARE.

### Clés de plateformes

| Clé | Nom affiché | Statut |
|-----|-------------|--------|
| `emotionscare` | EmotionsCare | production |
| `nearvity` | NEARVITY | prototype |
| `system-compass` | System Compass | production |
| `growth-copilot` | Growth Copilot | production |
| `med-mng` | Med MNG | production |
| `swift-care-hub` | UrgenceOS | prototype |
| `track-triumph-tavern` | Track Triumph | production |
| `trust-seal-chain` | Gouvernance Agents IA | prototype |
| `studybeats` | StudyBeats | production |
| `vascular-atlas` | Vascular Atlas | prototype |

### Shape attendu (TypeScript)

```typescript
{
  key: string;             // Identifiant unique (slug)
  name: string;            // Nom d'affichage
  shortDescription: string;// Résumé court
  description: string;     // Description complète
  tagline: string;         // Accroche marketing
  github: string;          // URL du repo GitHub
  liveUrl: string;         // URL de production/preview
  color: string;           // Classe Tailwind de couleur
  stats: {
    modules: number;
    tables: number;
    edgeFunctions: number;
    branches: number;
    commits: number;
    tests: number;
  };
  features: string[];      // 5 features clés
  status: "production" | "prototype" | "beta" | "deprecated";
  lastCommit: string;      // Format YYYY-MM-DD
}
```

### Fichiers source de vérité

| Fichier | Rôle |
|---------|------|
| `src/lib/constants.ts` | Données + stats des 10 plateformes |
| `src/lib/platformConfig.ts` | Icônes, accents, styles visuels |
| `src/lib/validation.ts` | `platformKeySchema` + `managedPlatformSchema` (Zod) |
| `src/i18n/platforms.ts` | Traductions FR/EN/DE (tagline, description, features) |
| `src/i18n/home.ts` | Features items pour la page d'accueil |

### Synchronisation

L'ajout d'une plateforme nécessite la mise à jour de **tous** les fichiers ci-dessus. Un test automatisé (`platform-config-sync.test.ts`) vérifie :
- Chaque clé a une config visuelle (pas de fallback default)
- Le nombre de features items i18n == nombre de plateformes
- Le schema Zod valide le shape complet de chaque entrée

---

*Dernière mise à jour: 08/03/2026 — v1.1*
