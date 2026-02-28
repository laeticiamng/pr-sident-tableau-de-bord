

# Plan d'execution : 8 Tickets Durcissement Production-Ready

## Etat reel verifie par audit du code

Apres lecture exhaustive des fichiers :
- **29/29 run types** : Le registre (`run-types-registry.ts`) et l'edge function (`executive-run/index.ts`) sont synchronises. Les 4 types ajoutes recemment (`DEPLOY_TO_PRODUCTION`, `RLS_POLICY_UPDATE`, `MASS_EMAIL_CAMPAIGN`, `PRICING_CHANGE`) sont presents des deux cotes.
- **Logging** : `insert_hq_log` est appele a 3 moments dans l'edge function : `run.started`, `run.completed`, `run.failed`. Le `StructuredLogsViewer.tsx` est en place avec filtrage niveau/source et refresh 30s.
- **Autopilot** : `AbortController` + `isDecidingRef` implementes. Anti-double run present dans `ai-scheduler` (check `status = 'running'` < 10 min). Journal des decisions IA affiche dans `SchedulerPanel.tsx`.
- **ErrorBoundary** : Global dans `App.tsx` (wrap du Router). Toasts d'erreur dans `useExecuteRun`.
- **BriefingRoom** : Null guards, `stripeError` check, badge "Moyenne" sur uptime — tous implementes.
- **AICostWidget** : Guards `Math.max(denominator, 1)` en place. Total mensuel affiche. Tooltips detailles.
- **Realtime** : Subscription `postgres_changes` sur `hq.runs` dans `AgentMonitoringDashboard`.

### Ce qui reste a faire (ecarts identifies)

1. **Test 29 run types** : Le test existant (`index_test.ts`) ne couvre que 7 types sur 29 dans sa liste. Il ne verifie pas la correspondance registry/backend.
2. **Typage strict RunType** : `useExecuteRun` accepte `run_type: string` (pas `RunType`). Le composant `AgentMonitoringDashboard` aussi.
3. **Logging edge** : Deja en place (3 logs). Mais pas de metadata `cost_estimate` dans les logs.
4. **Autopilot verrou DB** : Le check anti-double est fait via `get_hq_recent_runs` (lecture), pas via verrou transactionnel. C'est suffisant pour le cas d'usage actuel (polling 5 min) mais pourrait etre renforce.
5. **Monitoring realtime** : Pas de cleanup debounce sur les events realtime. Chaque `INSERT/UPDATE` sur `hq.runs` declenche un `refetch()` immediat.
6. **AICostWidget** : Le recalcul mensuel est base sur les 100 derniers runs (`useRecentRuns(100)`), pas sur tous les runs du mois. Si > 100 runs/mois, le total sera incorrect.
7. **Tests E2E** : Aucun test composant pour `AgentMonitoringDashboard`, `AICostWidget`, `BriefingRoom`.
8. **Documentation technique** : Pas de document d'architecture unifie pour le run system.

---

## Ticket 1 -- Test complet 29/29 Run Types (P0)

Mettre a jour `supabase/functions/executive-run/index_test.ts` pour :
- Lister les 29 run types complets (pas seulement 7)
- Verifier que chaque type retourne 400 "Unknown run type" quand envoye SANS auth valide (confirme qu'il est reconnu par le backend avant le check auth)
- Verifier qu'un type invalide retourne bien 400
- Verifier la coherence des modeles dans `MODEL_CONFIG`

**Fichier** : `supabase/functions/executive-run/index_test.ts`

---

## Ticket 2 -- Typage strict RunType cote client (P0)

Renforcer le typage pour empecher les strings libres :
- Modifier `useExecuteRun` dans `useHQData.ts` : changer `run_type: string` en `run_type: RunType` (import depuis `run-types-registry`)
- Modifier `AgentMonitoringDashboard.tsx` : typer le `AVAILABLE_RUNS` avec `RunType`
- Ajouter un test unitaire dans `src/test/run-engine.test.ts` qui verifie que toutes les cles du `RUN_TYPES_REGISTRY` sont presentes dans `RUN_TYPE_CONFIG`

**Fichiers** : `src/hooks/useHQData.ts`, `src/components/hq/AgentMonitoringDashboard.tsx`, `src/test/run-engine.test.ts`

---

## Ticket 3 -- Logging enrichi avec cost_estimate (P1)

Ajouter `cost_estimate` dans les metadata des logs `run.started` et `run.completed` dans l'edge function.
- Importer la map de couts depuis le registre (repliquer les valeurs dans l'edge function puisque le registre frontend n'est pas accessible)
- Ajouter `cost_estimate` dans le log metadata

**Fichier** : `supabase/functions/executive-run/index.ts`

---

## Ticket 4 -- Autopilot : renforcement anti-course (P1)

Le mecanisme actuel (lecture `get_hq_recent_runs` + check status running < 10 min) est fonctionnel mais peut etre renforce :
- Ajouter un log `autopilot.skip_duplicate` quand un run est ignore (deja present dans le code, confirme)
- Ajouter un timeout plus strict : si un run est `running` depuis > 15 min, le considerer comme bloque et autoriser un nouveau run
- Ajouter un compteur de runs lances par cycle dans la reponse `ai_decide`

**Fichier** : `supabase/functions/ai-scheduler/index.ts`

---

## Ticket 5 -- Monitoring realtime debounce (P1)

Eviter les refetch multiples rapides quand plusieurs events arrivent en rafale :
- Ajouter un debounce de 2 secondes sur le callback realtime dans `AgentMonitoringDashboard.tsx`
- Cleanup propre du channel au unmount (deja fait, confirme)

**Fichier** : `src/components/hq/AgentMonitoringDashboard.tsx`

---

## Ticket 6 -- AICostWidget : requete sans limite 100 (P1)

Le widget utilise `useRecentRuns(100)` ce qui plafonne les calculs. Remplacer par une requete dediee qui recupere tous les runs du mois en cours :
- Creer un hook `useMonthlyRuns()` qui appelle `get_hq_recent_runs` avec un `limit_count` de 500 (ou creer une RPC dediee `get_hq_monthly_runs`)
- Utiliser ce hook dans `AICostWidget` au lieu de `useRecentRuns(100)`

**Fichier** : `src/components/hq/AICostWidget.tsx`, `src/hooks/useHQData.ts`

---

## Ticket 7 -- Tests composants HQ (P2)

Creer 3 fichiers de test :
- `src/test/components/AgentMonitoringDashboard.test.tsx` : render, KPIs, filtre echecs, etat vide
- `src/test/components/AICostWidget.test.tsx` : render, calcul cout, absence NaN, mode compact
- `src/test/components/BriefingRoom.test.tsx` : render, KPIs avec/sans Stripe, null guards

**Fichiers** : 3 nouveaux fichiers de test

---

## Ticket 8 -- Documentation architecture Run System (P2)

Creer un document `docs/RUN_SYSTEM_ARCHITECTURE.md` avec :
- Diagramme du flux registry - edge function - DB
- Liste des 29 run types avec agent, modele, cout
- Politique de securite (JWT + RBAC + RLS)
- Mecanisme autopilot (polling, anti-double, journal decisions)
- Schema de logging structure

**Fichier** : `docs/RUN_SYSTEM_ARCHITECTURE.md`

---

## Ordre d'execution

| Etape | Tickets | Description |
|-------|---------|-------------|
| 1 | 2 + 3 | Typage strict + logging enrichi |
| 2 | 5 + 6 | Debounce realtime + fix limite 100 |
| 3 | 4 | Renforcement autopilot |
| 4 | 1 + 7 | Tests edge function + composants |
| 5 | 8 | Documentation |

**Total estime : 3-4 messages.**

