
# Plan d'implementation -- 8 Tickets de Durcissement Production

## Vue d'ensemble

Apres audit complet du code, voici l'etat reel et les actions restantes pour chaque ticket. Certains elements sont deja partiellement implementes, d'autres necessitent des corrections ou completions.

---

## Ticket 1 -- Fix 401 platform-monitor + blank screen (P0)

**Etat actuel** : Le hook `usePlatformMonitor.ts` a deja `enabled: !!user` (diff precedent). Mais `TrustPage.tsx` appelle `useConsolidatedMetrics()` qui depend de `usePlatformMonitor` -- si `user` est null, les metrics retournent des valeurs par defaut (0% uptime, 0 plateformes) ce qui affiche "0% uptime (0/7 plateformes)".

**Actions** :
1. Dans `TrustPage.tsx` : conditionner l'affichage du bloc uptime a `user && metrics.totalPlatforms > 0` au lieu de juste `!metricsLoading`
2. Ajouter un fallback UI quand les metrics ne sont pas disponibles (utilisateur non connecte) -- soit masquer le bloc, soit afficher un message neutre
3. Verifier que `useConsolidatedMetrics` ne produit aucune erreur quand les donnees sont absentes

**Fichiers** : `src/pages/TrustPage.tsx`, `src/hooks/usePlatformMonitor.ts`

---

## Ticket 2 -- Typage strict Run Types client (P0)

**Etat actuel** : `RunType` est deja defini comme `keyof typeof RUN_TYPES_REGISTRY` dans `run-types-registry.ts`. `useExecuteRun` utilise deja `RunType` dans sa signature. `AgentMonitoringDashboard` utilise `RunType` pour `AVAILABLE_RUNS`.

**Actions** :
1. Ajouter une fonction guard `isValidRunType(s: string): s is RunType` dans `run-types-registry.ts`
2. Utiliser ce guard dans `useAutopilot.ts` (ligne `autoExecuteRun`) qui passe actuellement `runType: string`
3. Renforcer `getRunCost`, `getRunAgent`, `getRunModel` pour logger un warning si le type est inconnu

**Fichiers** : `src/lib/run-types-registry.ts`, `src/hooks/useAutopilot.ts`

---

## Ticket 3 -- Sync registry/edge function (P1)

**Etat actuel** : Les 29 types existent dans les deux fichiers (`RUN_TYPES_REGISTRY` et `RUN_TEMPLATES` dans executive-run). Pas de verification automatique.

**Actions** :
1. Creer un test `src/test/run-types-sync.test.ts` qui verifie que les cles de `RUN_TYPES_REGISTRY` correspondent exactement a celles de `RUN_TYPE_CONFIG` dans `run-engine.ts`
2. Documenter la procedure d'ajout dans un commentaire en tete de `run-types-registry.ts`

**Fichiers** : `src/test/run-types-sync.test.ts`, `src/lib/run-types-registry.ts`

---

## Ticket 4 -- Logging structure production-grade (P1)

**Etat actuel** : L'edge function `executive-run` log deja via `insert_hq_log` RPC. La table `hq.structured_logs` existe. Le `StructuredLogsViewer` fonctionne.

**Actions** :
1. Enrichir les logs dans `executive-run/index.ts` : ajouter `duration_ms` dans le log completed, et `error_stack` (tronque a 500 chars) dans le log failed
2. Ajouter un log `run.started` au debut de chaque execution (pas seulement completed/failed)
3. Creer une migration pour ajouter un index sur `(level, created_at)` pour des requetes performantes
4. Ajouter une migration pour un cron de purge 30 jours (ou une RPC de purge manuelle)

**Fichiers** : `supabase/functions/executive-run/index.ts`, migration SQL

---

## Ticket 5 -- Autopilot anti-course (P1)

**Etat actuel** : `ai-scheduler/index.ts` a deja un mecanisme de verification des runs recents (check `status = running`). Le hook `useAutopilot.ts` a un check local `canAutoRun`.

**Actions** :
1. Dans `ai-scheduler/index.ts` : verifier que le check anti-duplication utilise un seuil configurable (15 min timeout pour runs bloques)
2. Ajouter un log `stuck_run_override` quand un run bloque est depasse
3. S'assurer que le compteur `runs_launched` / `runs_skipped` est retourne dans la reponse

**Fichiers** : `supabase/functions/ai-scheduler/index.ts`

---

## Ticket 6 -- Monitoring Realtime stabilise (P1)

**Etat actuel** : `AgentMonitoringDashboard.tsx` a deja un debounce 2s et un `removeChannel` au cleanup. C'est fonctionnel.

**Actions** :
1. Verifier que la subscription n'est pas recréée inutilement (dependances du useEffect)
2. Ajouter un guard pour eviter les appels `refetch()` si le composant est en cours de demontage (ref `isMounted`)

**Fichiers** : `src/components/hq/AgentMonitoringDashboard.tsx`

---

## Ticket 7 -- AICostWidget anti-NaN (P1)

**Etat actuel** : Le widget utilise deja `Math.max(DAILY_BUDGET, 1)` et `Math.max(MONTHLY_BUDGET, 1)` pour eviter les divisions par zero. Il utilise `(monthlyCost || 0)` comme guard.

**Actions** :
1. Ajouter un guard sur la projection : `Math.max(today.getDate(), 1)` est deja present -- verifier coherence
2. Ajouter `isFinite()` check sur les valeurs affichees
3. Tester l'affichage avec 0 runs (valeurs de secours)

**Fichiers** : `src/components/hq/AICostWidget.tsx`

---

## Ticket 8 -- Hardening UI : ErrorBoundary + gestion erreurs (P2)

**Etat actuel** : `ErrorBoundary` est deja en place dans `App.tsx` (wrapping global). Il affiche un fallback avec boutons "Reessayer" et "Accueil".

**Actions** :
1. Ajouter un `ErrorBoundary` autour de chaque route HQ individuellement (dans `HQLayout`) pour eviter qu'une erreur sur une page ne crash tout le HQ
2. Ameliorer `useExecuteRun` pour mapper les codes erreur edge (401, 403, 500) en messages user-friendly
3. S'assurer qu'aucune Promise non geree ne peut produire un blank screen

**Fichiers** : `src/components/layout/HQLayout.tsx`, `src/hooks/useHQData.ts`, `src/components/ErrorBoundary.tsx`

---

## Sequencage d'implementation

```text
Sprint 1 (P0) :
  T1: Fix TrustPage fallback + guard metrics  ~30 min
  T2: Guard isValidRunType + typage autopilot  ~45 min

Sprint 2 (P1) :
  T3: Test sync registry                       ~30 min
  T4: Logs enrichis + index DB                 ~1h
  T5: Anti-course ai-scheduler                 ~30 min
  T6: isMounted guard realtime                 ~15 min
  T7: isFinite guards AICostWidget             ~15 min

Sprint 3 (P2) :
  T8: ErrorBoundary par route + mapping erreurs ~45 min
```

## Details techniques

- **Migration SQL** : Un index `CREATE INDEX idx_structured_logs_level_created ON hq.structured_logs (level, created_at DESC)` sera cree pour les requetes de logs
- **Aucune dependance nouvelle** requise
- **Compatibilite** : Toutes les modifications sont retro-compatibles, aucun breaking change
- Les 29 run types restent inchanges
