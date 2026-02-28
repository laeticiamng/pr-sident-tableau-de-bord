

# Plan d'execution : 8 Tickets Production-Ready

## Etat des lieux reel (apres audit)

- **Badge "2 Errors"** : Provient du scanner `supabase_lov` avec 2 findings `level: "error"` non marques comme ignores :
  1. `role_permissions_public_exposure` — Faux positif. La policy `Deny anon access to role_permissions USING(false)` existe deja.
  2. `contact_messages_public_exposure` — Faux positif. La policy `Deny anon select on contact_messages USING(false)` existe deja.
  - **Solution** : Marquer ces 2 findings comme `ignore: true` via `security--manage_security_finding`. Badge vert immediat.
- **29 run types** : Synchronises entre registry et edge function (confirme).
- **Monitoring, KPIs, Autopilot** : En place et fonctionnels.
- **Logging** : Table `hq.structured_logs` et RPCs existent. L'edge function `executive-run` ne les utilise pas encore.
- **ErrorBoundary** : Deja en place dans `App.tsx` (wrap global du Router).

---

## Ticket 1 — Fermer le badge "Security: 2 Errors" (P0, 1 action)

Les 2 "errors" sont des faux positifs du scanner automatique. Les policies RLS existent deja.

**Action** : Executer `security--manage_security_finding` pour marquer les 2 findings comme `ignore: true` avec justification technique.

**Resultat** : Badge Security passe au vert.

---

## Ticket 2 — Test edge function des 29 run types (P0)

Creer un fichier de test Deno `supabase/functions/executive-run/index_test.ts` qui :
- Verifie que chaque cle du registre frontend (`run-types-registry.ts`) a un template correspondant dans `RUN_TEMPLATES`
- Teste un appel reel sur 1-2 run types (validation 200, structure reponse)
- Verifie qu'un run type invalide retourne 400

**Fichiers** : `supabase/functions/executive-run/index_test.ts`

---

## Ticket 3 — Logging structure dans l'edge function (P1)

L'edge function `executive-run` ne log rien dans `hq.structured_logs`.

**Actions** :
- Ajouter un appel `insert_hq_log` via `supabaseAdmin.rpc()` a 3 moments :
  - Debut : `INFO`, `run.started`, metadata `{run_type, platform_key, model}`
  - Fin : `INFO`, `run.completed`, metadata + `duration_ms`
  - Erreur : `ERROR`, `run.failed`, metadata + `error_message`
- Creer `StructuredLogsViewer.tsx` : composant avec filtrage niveau/source, affiche sur la page monitoring
- Migration SQL : index sur `(level, created_at DESC)` + cron de purge 30 jours

**Fichiers** : `supabase/functions/executive-run/index.ts`, nouveau `src/components/hq/diagnostics/StructuredLogsViewer.tsx`, `src/pages/hq/AgentsMonitoringPage.tsx`, migration SQL

---

## Ticket 4 — Hardening UI global (P1)

**Actions** :
- Ajouter des `ErrorBoundary` locaux sur les composants critiques (MonitoringDashboard, BriefingRoom KPIs) avec fallback "Impossible de charger ce module"
- Ajouter un toast automatique dans `useExecuteRun` quand l'edge function retourne une erreur non-200
- Verifier les null guards dans AICostWidget (deja `|| 0` mais ajouter sur division)

**Fichiers** : `src/components/hq/AgentMonitoringDashboard.tsx`, `src/pages/hq/BriefingRoom.tsx`, `src/hooks/useHQData.ts`, `src/components/hq/AICostWidget.tsx`

---

## Ticket 5 — Autopilot anti-double run (P1)

**Actions** :
- Dans `ai-scheduler/index.ts`, avant de lancer un run : verifier via RPC si un run du meme `run_type` a `status = 'running'` dans les 10 dernieres minutes
- Ajouter un journal des decisions IA dans `SchedulerPanel.tsx` qui affiche les 5 dernieres decisions avec le reasoning (requete `get_hq_logs` avec `source = 'autopilot'`)

**Fichiers** : `supabase/functions/ai-scheduler/index.ts`, `src/components/hq/SchedulerPanel.tsx`

---

## Ticket 6 — Monitoring temps reel (P1)

**Actions** :
- Activer Supabase Realtime sur `hq.runs` (`ALTER PUBLICATION supabase_realtime ADD TABLE hq.runs`)
- Souscrire aux changements dans `AgentMonitoringDashboard` pour mettre a jour le statut sans refresh manuel
- Afficher un indicateur visuel de transition `idle -> running -> done`

**Fichiers** : Migration SQL (realtime), `src/components/hq/AgentMonitoringDashboard.tsx`

---

## Ticket 7 — Audit cout IA fiabilise (P1)

**Actions** :
- Ajouter `Math.max(denominator, 1)` dans toutes les divisions de AICostWidget
- Ajouter un compteur "Total mensuel" en gros chiffre dans le header (deja fait, verifier NaN)
- Ajouter tooltip detaille sur chaque barre : nombre de runs, cout moyen, run_types concernes

**Fichiers** : `src/components/hq/AICostWidget.tsx`

---

## Ticket 8 — Suite de tests E2E (P2)

**Actions** :
- Creer `src/test/components/AgentMonitoringDashboard.test.tsx` : render, affichage KPIs, filtre echecs
- Creer `src/test/components/AICostWidget.test.tsx` : render, calcul cout, absence NaN
- Creer `src/test/components/BriefingRoom.test.tsx` : render, KPIs, fallback Stripe error

**Fichiers** : 3 nouveaux fichiers de test

---

## Ordre d'execution

| Etape | Tickets | Estimation |
|-------|---------|------------|
| 1 | Ticket 1 (badge security) | 0.2 msg |
| 2 | Tickets 4+7 (hardening + couts) | 0.5 msg |
| 3 | Ticket 3 (logging edge function + viewer) | 1 msg |
| 4 | Tickets 5+6 (autopilot + realtime) | 1 msg |
| 5 | Tickets 2+8 (tests) | 1 msg |

**Total estime : 3-4 messages.**

### Dependances
- Ticket 3 avant Ticket 5 (les logs sont utilises par le journal des decisions)
- Ticket 1 est independant et peut etre fait immediatement
- Tickets 4 et 7 sont independants

