# Run System Architecture — EMOTIONSCARE HQ

## Vue d'ensemble

Le Run System est le moteur d'exécution IA du HQ. Il orchestre 29 types de runs pilotés par des agents IA spécialisés, avec traçabilité complète, contrôle des coûts et gouvernance multi-niveaux.

## Diagramme de flux

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Frontend (UI)  │────▶│  Edge Function        │────▶│  Lovable AI     │
│                 │     │  executive-run         │     │  Gateway        │
│  - Dashboard    │     │                        │     │                 │
│  - CommandPalette│    │  1. Auth (JWT+RBAC)    │     │  Models:        │
│  - Autopilot    │     │  2. Log run.started    │     │  - gemini-2.5-pro│
│                 │     │  3. Fetch context      │     │  - gemini-3-flash│
│  useExecuteRun()│     │  4. Call AI Gateway    │     │  - gpt-5.2      │
│  RunType strict │     │  5. Log run.completed  │     │  - gemini-2.5-flash│
└─────────────────┘     │  6. Return result      │     └─────────────────┘
                        └──────────┬───────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │ hq.runs  │  │ hq.      │  │ GitHub   │
              │ (DB)     │  │ structured│  │ Perplexity│
              │          │  │ _logs    │  │ Firecrawl │
              └──────────┘  └──────────┘  └──────────┘
```

## Registre des 29 Run Types

Source unique : `src/lib/run-types-registry.ts`

| Run Type | Agent | Modèle | Coût estimé | Risque |
|----------|-------|--------|-------------|--------|
| DAILY_EXECUTIVE_BRIEF | CEO Agent 👔 | gemini-2.5-pro | €0.10 | low |
| CEO_STANDUP_MEETING | CEO Agent 👔 | gemini-3-flash | €0.05 | low |
| PLATFORM_STATUS_REVIEW | CTO Agent ⚙️ | gemini-2.5-flash | €0.02 | low |
| SECURITY_AUDIT_RLS | CISO Agent 🔒 | gemini-2.5-pro | €0.18 | medium |
| RELEASE_GATE_CHECK | CTO Agent ⚙️ | gemini-2.5-pro | €0.12 | high |
| DEPLOY_TO_PRODUCTION | CTO Agent ⚙️ | gemini-2.5-pro | €0.15 | critical |
| RLS_POLICY_UPDATE | CISO Agent 🔒 | gemini-2.5-pro | €0.20 | critical |
| COMPETITIVE_ANALYSIS | CSO Agent 🎯 | gemini-2.5-pro | €0.25 | low |
| QUALITY_AUDIT | CTO Agent ⚙️ | gemini-2.5-pro | €0.15 | medium |
| ADS_PERFORMANCE_REVIEW | CMO Agent 📣 | gemini-2.5-flash | €0.10 | low |
| GROWTH_STRATEGY_REVIEW | CGO Agent 📈 | gemini-2.5-pro | €0.22 | low |
| OKR_QUARTERLY_REVIEW | COO Agent 📋 | gemini-2.5-flash | €0.08 | low |
| COMPLIANCE_RGPD_CHECK | DPO Agent 🛡️ | gemini-2.5-pro | €0.16 | medium |
| SEO_AUDIT | CMO Agent 📣 | gemini-2.5-flash | €0.20 | low |
| CONTENT_CALENDAR_PLAN | CMO Agent 📣 | gemini-3-flash | €0.06 | low |
| REVENUE_FORECAST | CFO Agent 💰 | gemini-2.5-pro | €0.14 | low |
| LEAD_SCORING_UPDATE | CGO Agent 📈 | gemini-2.5-flash | €0.07 | low |
| FINANCIAL_REPORT | CFO Agent 💰 | gemini-2.5-pro | €0.12 | low |
| RGPD_AUDIT | DPO Agent 🛡️ | gemini-2.5-pro | €0.16 | medium |
| VULNERABILITY_SCAN | CISO Agent 🔒 | gemini-2.5-pro | €0.18 | medium |
| ROADMAP_UPDATE | CPO Agent 🗺️ | gemini-2.5-flash | €0.08 | low |
| CODE_REVIEW | CTO Agent ⚙️ | gemini-2.5-pro | €0.12 | low |
| DEPLOYMENT_CHECK | CTO Agent ⚙️ | gemini-2.5-flash | €0.06 | low |
| DATA_INSIGHTS_REPORT | CDO Agent 📊 | gemini-2.5-pro | €0.14 | low |
| AGENT_PERFORMANCE_REVIEW | COO Agent 📋 | gemini-2.5-flash | €0.08 | low |
| TECH_WATCH_REPORT | CTO Agent ⚙️ | gemini-2.5-flash | €0.10 | low |
| MARKETING_WEEK_PLAN | CMO Agent 📣 | gemini-3-flash | €0.04 | low |
| MASS_EMAIL_CAMPAIGN | CMO Agent 📣 | gemini-2.5-pro | €0.15 | high |
| PRICING_CHANGE | CFO Agent 💰 | gemini-2.5-pro | €0.20 | critical |

**Coût mensuel estimé (tous runs)** : ~€3.50/run complet

## Politique de sécurité

### Authentification
- JWT obligatoire sur toutes les Edge Functions
- Validation via `supabaseAuth.auth.getClaims(token)`
- Rejet 401 si token absent ou invalide

### Autorisation (RBAC)
- Vérification rôle `owner` via RPC `has_role(_user_id, 'owner')`
- Rejet 403 si rôle insuffisant
- Toutes les RPCs HQ (`get_hq_*`, `insert_hq_*`) vérifient `is_owner()`

### RLS (Row-Level Security)
- Tables `hq.*` protégées par schéma séparé
- Accès exclusif via RPCs `SECURITY DEFINER`
- Aucun accès direct aux tables depuis le client

### Sanitisation
- Messages d'erreur génériques en production ("Service temporarily unavailable")
- Pas d'exposition de variables d'environnement ou de stack traces

## Mécanisme Autopilot

### Polling
- Hook `useAIAutopilot` poll toutes les 5 minutes quand activé
- `AbortController` pour annuler les requêtes en vol
- `isDecidingRef` pour éviter les exécutions parallèles

### Anti-double run
1. Avant chaque exécution, vérification via `get_hq_recent_runs`
2. Si un run du même type a `status = 'running'` depuis < 15 min → skip
3. Si run bloqué > 15 min → considéré comme stuck, nouveau run autorisé
4. Log `autopilot.skip_duplicate` ou `autopilot.stuck_run_override`

### Journal des décisions IA
- Chaque cycle `ai_decide` produit un log `autopilot.decision`
- Contient : `jobs_to_run`, `reasoning`, `next_check_in_minutes`
- Visible dans `SchedulerPanel.tsx` (5 derniers logs)

## Schéma de logging structuré

### Table : `hq.structured_logs`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| level | TEXT | info, warn, error |
| source | TEXT | executive-run, autopilot, system |
| message | TEXT | run.started, run.completed, run.failed |
| metadata | JSONB | run_type, model, duration_ms, cost_estimate |
| run_id | UUID | Référence au run (nullable) |
| created_at | TIMESTAMPTZ | Horodatage |

### Événements de logging
| Message | Level | Metadata |
|---------|-------|----------|
| run.started | info | run_type, platform_key, model, user_id, cost_estimate |
| run.completed | info | run_type, model, duration_ms, run_id, cost_estimate |
| run.failed | error | error_message, error_stack |
| autopilot.decision | info | jobs_to_run, reasoning, paris_hour |
| autopilot.skip_duplicate | warn | job_key, run_type, running_minutes |
| autopilot.stuck_run_override | warn | job_key, stuck_run_id, running_minutes |

### Index DB
- `idx_structured_logs_level_created` : (level, created_at DESC)
- `idx_structured_logs_source_created` : (source, created_at DESC)

### Rétention
- Purge automatique des logs > 30 jours via cron `purge-old-hq-logs`

## Synchronisation Registry ↔ Backend

Les 29 run types doivent être présents dans :
1. `src/lib/run-types-registry.ts` — Source frontend (labels, agents, coûts)
2. `src/lib/run-engine.ts` — Config moteur (steps, risk levels, approbation)
3. `supabase/functions/executive-run/index.ts` — Templates backend (prompts, modèles)
4. `supabase/functions/executive-run/index_test.ts` — Tests anti-régression

### Tests de cohérence
- `src/test/run-engine.test.ts` vérifie la synchronisation registry ↔ config (29/29)
- `index_test.ts` vérifie les 29 types côté edge function
