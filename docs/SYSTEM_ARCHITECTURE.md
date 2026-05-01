# Architecture Système — Pattern HQ répliqué sur chaque plateforme

> Source de vérité : `src/data/systemArchitecture.ts`
> Page exécutive : `/hq/architecture`

Ce document décrit la **logique d'architecture de système complexe** appliquée
systématiquement à chaque plateforme du portefeuille EMOTIONSCARE SASU.
Il sert de référence d'audit et de checklist d'industrialisation.

## Principes directeurs

1. **Aucune confiance implicite** — toute lecture/écriture est autorisée explicitement.
2. **Aucun accès direct aux tables sensibles** — l'API client ne voit que des RPC.
3. **Aucun job sans traçabilité** — chaque exécution IA est typée, persistée, journalisée.
4. **Aucune erreur silencieuse** — DLQ + retry exponentiel + audit immuable.
5. **Aucune donnée mock en HQ** — fallback UI explicite "Connection Required".

## Les 7 couches du pattern

### 1. Schéma SQL isolé
- Schéma dédié (`hq` pour le siège, `<platform>_core` pour chaque produit).
- Tables tenant-scoped via `organization_id` + jointure `organization_members`.
- Vues read-only pour cross-platform ; jamais d'écriture inter-schéma.

### 2. RLS stricte (pas de `USING true`)
- Fonctions `SECURITY DEFINER` : `is_owner()`, `has_role()`, `has_org_access()`, `has_permission()`.
- Politique anon explicitement `DENY` sur toutes les tables sensibles.
- Rôles applicatifs via enum `app_role` + `user_roles` séparé du profil.

### 3. RPC SECURITY DEFINER
- Toute donnée métier passe par une RPC nommée `get_*`, `insert_*`, `update_*`.
- Première instruction : `IF NOT public.is_owner() THEN RAISE EXCEPTION`.
- `set search_path = 'public', '<schema>'` figé pour éviter les attaques de path.

### 4. Edge Functions sécurisées
- `Deno.serve()` + CORS strict + validation Zod du body.
- Auth shared (`_shared/auth.ts`) : JWT obligatoire + RBAC `is_owner`.
- Erreurs sanitizées (jamais de stack, jamais d'env). Réponses 401/403/500 typées.
- Circuit-breaker `_shared/circuit-breaker.ts` autour de l'AI Gateway.
- Rate-limit DB `_shared/rate-limit-db.ts` persistant via `rate_limit_buckets`.

### 5. Run Engine + DLQ
- 29 `run_type` dans `src/lib/run-types-registry.ts` (frontend) ↔ `executive-run/index.ts` (backend).
- Persistance dans `hq.runs` avec `started_at`, `completed_at`, coût estimé.
- Échecs routés vers `hq.runs_dlq` avec `next_retry_at` (1 → 5 → 30 min, max 3 tentatives).
- Worker `retry-dlq-runs` rejoue les entrées `pending` via `FOR UPDATE SKIP LOCKED`.

### 6. Autopilot anti-duplication
- `ai-scheduler` déclenché par pg_cron, header `X-Cron-Secret` constant-time.
- Avant chaque exécution : check `get_hq_recent_runs` → skip si run identique < 10 min.
- Override stuck-run > 15 min, log `autopilot.stuck_run_override`.
- Journal des décisions IA visible dans `SchedulerPanel.tsx`.

### 7. Observabilité & gouvernance
- `hq.structured_logs` (30 jours) + `hq.audit_logs` (immuable).
- `/healthz` public agrégeant DB + AI Gateway + breaker.
- RPC `get_hq_slo_status` : uptime, p95 runs, success rate, freshness.
- UI : `MethodologyDisclosure` + `ExecutiveHeader` sur 18+ pages HQ.

## Couverture actuelle par plateforme

| Plateforme | Statut | Notes |
|---|---|---|
| EmotionsCare | ✅ Applied | Référence du pattern |
| Growth Copilot | ✅ Applied | 39 agents sur pattern complet |
| Med MNG | 🟡 Partial | RPC + DLQ génération musicale à câbler |
| System Compass | 🟡 Partial | Registre run_type + SLO à compléter |
| NEARVITY | 🟡 Partial | Run engine modération + p95 |
| UrgenceOS | 🟡 Partial | **P1** — audit immuable + alerting multi-zones |
| Track Triumph | 🟡 Partial | DLQ + SLO |
| Gouvernance Agents IA | 🟡 Partial | Run engine certification |
| StudyBeats | 🔴 Todo | Prototype, pattern à dérouler |
| Vascular Atlas | 🔴 Todo | Renforcement RGPD/RLS prioritaire |

## Procédure d'application sur une nouvelle plateforme

1. Créer le schéma `<platform>_core` + table `organizations` linkée.
2. Activer RLS partout, écrire les RPC `get_*` avec garde `is_owner()` ou `has_org_access()`.
3. Déployer les Edge Functions via `_shared/auth.ts`, `_shared/cors.ts`, circuit-breaker.
4. Enregistrer les `run_type` dans `run-types-registry.ts` + `executive-run/index.ts` + tests.
5. Câbler le `scheduled-runs` cron + ajouter le check anti-double dans `ai-scheduler`.
6. Brancher `/healthz`, ajouter la plateforme au `platform-monitor`.
7. Ajouter une entrée dans `PLATFORM_ARCHITECTURE` (`src/data/systemArchitecture.ts`).

---
*Mis à jour automatiquement avec le registre TS — toute évolution du pattern doit modifier les deux.*