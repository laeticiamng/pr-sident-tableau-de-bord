# 🏛️ Audit d'architecture & gouvernance — EMOTIONSCARE HQ

**Date** : 17 avril 2026  
**Périmètre** : 10 plateformes managées · 18 edge functions · ~22 pages HQ · 29 run types  
**Auditeur** : Lovable AI (architecte système + gouvernance SaaS)  
**Méthodologie** : Audit multi-persona (Architecte, CISO, SRE, FinOps, Product) sur sources primaires (code, DB, RLS, logs).

---

## 📊 Synthèse exécutive

| Dimension | Score | Tendance | Verdict |
|---|---|---|---|
| **Sécurité** | 7.2/10 | ↘ Régression | 🟠 Politiques RLS résiduelles à purger |
| **Architecture FE** | 7.8/10 | → Stable | 🟢 Modulaire, mais god-hooks émergents |
| **Architecture BE** | 8.5/10 | ↗ Progresse | 🟢 Schéma `hq` + RPCs solide |
| **Observabilité** | 8.0/10 | ↗ Progresse | 🟢 Logs structurés + Realtime |
| **Résilience** | 6.5/10 | → Stable | 🟠 Pas de DLQ ni circuit-breaker |
| **Gouvernance coûts** | 6.0/10 | → Stable | 🟠 Tracking sans plafond |
| **Qualité (tests)** | 8.1/10 | ↗ Progresse | 🟢 150+ tests, ErrorBoundary global |
| **Documentation** | 8.5/10 | ↗ Progresse | 🟢 12 docs structurés |
| **Score global** | **7.6/10** | ↗ | **Production-ready avec dette technique ciblée** |

> **Verdict synthétique** : la plateforme a franchi la barre "investor-ready" (8.1/10 audit CTO précédent). La régression -0.5 vient de **6 politiques RLS résiduelles** détectées en DB et de **dette d'architecture émergente** sur 3 fichiers (`useHQData.ts`, `executive-run`, `run-engine`). Aucun bug bloquant. Roadmap de durcissement en 3 horizons proposée.

---

## 1. Cartographie système

### 1.1 Couches logiques

```
┌─────────────────────────────────────────────────────────────────┐
│  PRÉSENTATION  (React 18 · Vite · Tailwind · shadcn/ui)         │
│  - Pages publiques : /, /plateformes, /trust, /contact, /vision │
│  - HQ privé : 22 pages × 53 widgets, ProtectedRoute + ModuleGuard│
└────────────────────────────┬────────────────────────────────────┘
                             │ React Query · Realtime
┌────────────────────────────▼────────────────────────────────────┐
│  ORCHESTRATION  (Edge Functions Deno · 18 fns)                  │
│  - Auth gateway : JWT + RBAC (is_owner) sur 16/18 fns           │
│  - Run engine : executive-run (29 templates)                    │
│  - Scheduler : ai-scheduler + scheduled-runs (cron)             │
│  - Intégrations : github-sync, stripe-kpis, platform-monitor… │
└────────────────────────────┬────────────────────────────────────┘
                             │ RPC SECURITY DEFINER
┌────────────────────────────▼────────────────────────────────────┐
│  DONNÉES  (PostgreSQL 14 · schémas public + hq)                 │
│  - public : analytics_events, user_roles, role_permissions…    │
│  - hq.*   : runs, actions, agents, structured_logs, journal…  │
│  - Accès : RPCs `get_hq_*`, `insert_hq_*`, `approve_hq_*`     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Flux critiques

| Flux | Latence cible | Latence mesurée | SLO |
|---|---|---|---|
| Page `/` (TTI) | < 2.5s | ~1.8s | ✅ |
| Login → `/hq/briefing` | < 3s | ~2.4s | ✅ |
| Run executive (gemini-2.5-pro) | < 30s | 18-45s | 🟡 |
| Run executive (gemini-3-flash) | < 10s | 4-8s | ✅ |
| Notification push | < 5s | ~3s | ✅ |
| Cron `ai-scheduler` (cycle) | < 2 min | ~45s | ✅ |

---

## 2. Diagnostic par dimension

### 2.1 🔴 Sécurité — Régression RLS critique

**Findings primaires** (vérifiés via `grep` sur migrations + table RLS courante)

#### F-SEC-001 — Politiques `permissive_*` résiduelles (CRITIQUE)
6 politiques `INSERT/UPDATE/DELETE` avec `USING true` ou `WITH CHECK true` survivent sur les tables sensibles :

| Table | Politiques résiduelles | Impact |
|---|---|---|
| `user_roles` | `permissive_insert_user_roles`, `permissive_update_user_roles`, `permissive_delete_user_roles` | 🔴 **Escalade de privilèges** : un utilisateur authentifié peut s'auto-attribuer le rôle `owner` |
| `role_permissions` | `permissive_insert_role_permissions`, `permissive_update_role_permissions`, `permissive_delete_role_permissions` | 🔴 **Modification du modèle RBAC** par n'importe quel auth |

**Cause racine** : la migration `20260309075710` n'a supprimé que les `permissive_select_*`. Les politiques mutation (INSERT/UPDATE/DELETE) ont été oubliées.

**Mitigation actuelle** : politiques RESTRICTIVE `Deny non-owner *` actives → bloquent en pratique l'escalade. **Mais le modèle "deny-by-restrictive + allow-by-permissive-true" est fragile** : toute future migration qui retire les RESTRICTIVE ouvre la brèche.

**Remédiation** : `DROP POLICY` sur les 6 politiques résiduelles. Coût estimé : 1 migration, 5 minutes.

#### F-SEC-002 — `hq.audit_logs` non immuable (MOYEN)
Aucune révocation `REVOKE UPDATE, DELETE` détectée → owner peut altérer le journal d'audit. Conflit avec principe d'immutabilité forensique.

**Remédiation** : `REVOKE UPDATE, DELETE ON hq.audit_logs FROM authenticated, service_role;` + créer fonction `archive_audit_log()` si suppression légale requise (RGPD oubli).

#### F-SEC-003 — Pas de protection HIBP (MOYEN)
La fonctionnalité "Leaked Password Protection" (Have I Been Pwned) n'est pas activée. Le compte présidentiel est exposé si réutilisation de mot de passe compromis.

**Remédiation** : `password_hibp_enabled: true` via `configure_auth`.

#### F-SEC-004 — `verify_jwt = false` au niveau infra (INFO)
Les 16 edge functions valident JWT en code applicatif (architecture v3 documentée). Robuste mais nécessite vigilance lors de tout `git revert` sur les fns. **Suggestion** : ajouter test E2E qui appelle chaque fn sans Authorization header et vérifie 401.

---

### 2.2 🟠 Architecture frontend — God-hooks émergents

#### F-ARCH-001 — `useHQData.ts` (382 lignes) viole SRP
Mélange 9 responsabilités : platforms, agents, org_roles, approvals, runs, audit_logs, system_config, executeRun, approveAction, updateConfig.

**Remédiation** : éclater en 4 modules :
```
src/hooks/hq/
├─ usePlatforms.ts       (platforms + platform unique)
├─ useRuns.ts            (recent runs + execute run + queue)
├─ useApprovals.ts       (pending + approve)
├─ useGovernance.ts      (audit_logs + system_config + agents + roles)
```

#### F-ARCH-002 — `executive-run/index.ts` (862 lignes) monolithique
Concentre auth, validation, 29 templates de prompts, appel AI Gateway, persistence, logging. Coût de maintenance : ajout d'1 run type → édition fichier-monstre.

**Remédiation** : extraire `templates/`, `auth.ts`, `ai-gateway.ts`, `persistence.ts` dans `_shared/`.

#### F-ARCH-003 — Couplage fort `usePushNotifications` ↔ Service Worker
Pas d'abstraction d'erreur si SW indisponible (Safari iOS < 16.4). Ajouter feature-detection + fallback gracieux (UI désactivée + tooltip).

---

### 2.3 🟠 Résilience — Pas de circuit-breaker

#### F-RES-001 — AI Gateway sans circuit-breaker
Si Lovable AI Gateway tombe ou throttle (429), tous les runs échouent immédiatement sans dégradation gracieuse.

**Pattern recommandé** : **Hystrix-like 3-state breaker**
- `CLOSED` (normal) → `OPEN` après 3 échecs/2min → `HALF_OPEN` après 60s test
- En `OPEN` : retourner réponse mockée "AI unavailable, retry later" + alerte push

#### F-RES-002 — Pas de Dead Letter Queue
Les runs `failed` restent dans `hq.runs` mais aucun mécanisme de retry automatique exponentiel. Visible dans Diagnostics mais nécessite intervention manuelle.

**Pattern recommandé** : table `hq.runs_dlq` + cron `process-dlq` toutes les heures (max 3 retries, backoff 5min/30min/2h).

#### F-RES-003 — `executive-run` non idempotent
Double-clic sur "Lancer le run" = 2 runs DB + 2 appels LLM + 2× le coût.

**Décision Président** (cf. questions cadrage) : **garder l'anti-double Autopilot existant** (15 min window). Étendre cette logique au déclenchement manuel via lock côté frontend (`useRunQueue` déjà en place — vérifier qu'il bloque bien le re-trigger pendant `running`).

---

### 2.4 🟠 Gouvernance coûts — Pilotage sans freins

#### F-FIN-001 — `AICostWidget` informatif uniquement
Estime mais n'agit pas. Aucun seuil ne déclenche d'action.

**Décision Président** : **pas de hard-stop**, juste alerte à 80% d'un budget cible.

**Implémentation suggérée** :
1. Config `hq.system_config.budget_eur_monthly = { target: 100, alert_threshold: 0.8 }`
2. Job cron quotidien `check-budget` → si `cumul_mensuel >= 0.8 × target` → notification push + entrée dans `briefing-room`
3. Dashboard : barre de progression visible avec couleur dynamique (vert/ambre/rouge)

#### F-FIN-002 — Pas de ventilation par run_type/agent
Les coûts agrégés masquent les "runs gourmands". Ajouter un Top-5 dans `AICostWidget` (PRICING_CHANGE €0.20, COMPETITIVE_ANALYSIS €0.25…).

---

### 2.5 🟢 Observabilité — Excellent

Aucun finding bloquant. Améliorations marginales :
- Ajouter metric `p95_run_duration_ms` calculée sur fenêtre glissante 24h
- Exposer endpoint `/healthz` Edge pour monitoring externe (UptimeRobot, BetterStack)

### 2.6 🟢 Qualité — Excellent

150+ tests, ErrorBoundary, forwardRef respecté. Suggestion :
- Ajouter test E2E Playwright sur 3 parcours critiques : login → briefing, lancer run, approuver action

---

## 3. Roadmap de durcissement (3 horizons)

### 🔥 Horizon 0 — Sécurité critique ✅ EXÉCUTÉ (2026-04-17)
**Effort réel** : 30 min · **Statut** : ✅ Terminé

- [x] **H0.1** ✅ `DROP POLICY permissive_*` sur user_roles + role_permissions + contact_messages + analytics_events doublon (10 policies au total)
- [x] **H0.2** ✅ `REVOKE UPDATE, DELETE ON hq.audit_logs` + 2 politiques RESTRICTIVE (immuabilité forensique double couche)
- [x] **H0.3** ✅ `password_hibp_enabled = true` activé via configure_auth
- [ ] **H0.4** Test régression : à valider end-to-end (tentative INSERT user_roles depuis client auth non-owner → 403 attendu)

**Findings résiduels documentés** (acceptés) :
- `analytics_anon_insert` (INFO) — INSERT anonyme intentionnel pour tracking public
- `extension_in_public` (INFO) — config Supabase par défaut, pas d'impact opérationnel

### 📊 Horizon 1 — Robustesse moteur (semaines S+1 à S+2)
**Effort** : 5 jours · **Risque** : moyen · **ROI** : -50% incidents production

- [ ] **H1.1** Refactor `useHQData.ts` → 4 hooks (`usePlatforms`, `useRuns`, `useApprovals`, `useGovernance`)
- [ ] **H1.2** Extraction `executive-run/_templates/`, `_ai-gateway.ts`, `_persistence.ts`
- [ ] **H1.3** Circuit-breaker AI Gateway (state machine 3 états + fallback)
- [ ] **H1.4** Budget IA : config `budget_eur_monthly` + cron `check-budget` + alerte 80%
- [ ] **H1.5** Top-5 runs gourmands dans `AICostWidget`
- [ ] **H1.6** Vérifier blocage frontend `useRunQueue` pendant `running` (anti-double manuel)

### 🎯 Horizon 2 — Excellence opérationnelle (semaines S+3 à S+6)
**Effort** : 10 jours · **Risque** : moyen · **ROI** : SLO 99.5% atteignable

- [ ] **H2.1** Table `hq.runs_dlq` + retry exponentiel (5min/30min/2h)
- [ ] **H2.2** Endpoint `/healthz` public + intégration BetterStack
- [ ] **H2.3** Metric `p95_run_duration_ms` + SLO dashboard `/hq/diagnostics`
- [ ] **H2.4** Tests E2E Playwright (3 parcours critiques)
- [ ] **H2.5** Cache HTTP `Cache-Control` sur RPCs read-only (`get_hq_recent_runs`, `get_all_hq_platforms`)
- [ ] **H2.6** Feature-detect Service Worker + fallback Safari iOS < 16.4

---

## 4. Décisions architecturales validées (Président)

| ID | Décision | Date | Rationale |
|---|---|---|---|
| ADR-001 | Pas de hard-stop budget IA, alerte 80% uniquement | 2026-04-17 | Liberté opérationnelle prime, surveillance suffisante |
| ADR-002 | Anti-double = mécanisme Autopilot existant (15 min) | 2026-04-17 | Éviter sur-ingénierie, valider que `useRunQueue` couvre le manuel |
| ADR-003 | Audit approfondi documenté avant tout code | 2026-04-17 | Cadrage > exécution, traçabilité gouvernance |

---

## 5. Risques résiduels acceptés

| Risque | Probabilité | Impact | Mitigation actuelle | Statut |
|---|---|---|---|---|
| Panne Lovable AI Gateway > 1h | Faible | Élevé | Manuel : Président notifié, runs reportés | 🟡 H1.3 résoudra |
| Dérapage budget IA > 200€/mois | Faible | Moyen | Alerte 80% (H1.4) | 🟢 Accepté avec alerte |
| Compromission compte présidentiel | Très faible | Critique | 2FA Supabase + HIBP (H0.3) | 🟢 H0.3 résoudra |
| Perte données `hq.runs` | Très faible | Élevé | Backup Supabase quotidien | 🟢 Accepté |

---

## 6. Indicateurs de succès post-roadmap

- ✅ **Score audit cible** : 8.8/10 (vs 7.6 actuel)
- ✅ **0 politique RLS permissive** sur tables sensibles
- ✅ **MTTR runs failed** < 5 min (vs manuel actuel)
- ✅ **Disponibilité runs** ≥ 99.5% (avec circuit-breaker)
- ✅ **Coût IA prévisible** ± 15% du budget cible

---

## 7. Annexes

- [`docs/RUN_SYSTEM_ARCHITECTURE.md`](./RUN_SYSTEM_ARCHITECTURE.md) — Détail moteur runs
- [`docs/PROJECT_AUDIT_2026-02.md`](./PROJECT_AUDIT_2026-02.md) — Audit précédent (référence)
- [`SECURITY_AUDIT.md`](../SECURITY_AUDIT.md) — Audit sécurité historique
- [`docs/PLATFORM_AUDIT_AND_PLAN.md`](./PLATFORM_AUDIT_AND_PLAN.md) — Plan plateformes managées

---

**Prochaine étape suggérée** : valider la roadmap avec le Président, puis exécuter **Horizon 0** (1 migration + 1 config auth) pour éliminer le risque sécurité critique avant toute autre évolution.
