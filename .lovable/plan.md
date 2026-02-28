

# Plan d'implementation : 8 Tickets Production-Ready

## Etat des lieux

Apres audit complet du code et du scan de securite :
- **Securite** : 7 findings, tous "info" avec "ignore: true". Zero vulnerabilite critique/high. Le badge "2 Errors" correspond aux choix architecturaux documentes (contact form gatekeeper, analytics INSERT public).
- **Registry** : Le registre `run-types-registry.ts` declare 29 run types. L'edge function `executive-run` en declare 27. 4 types du registre n'existent pas dans le backend (`DEPLOY_TO_PRODUCTION`, `RLS_POLICY_UPDATE`, `MASS_EMAIL_CAMPAIGN`, `PRICING_CHANGE`) — ceux-ci provoqueraient une erreur 400 si declenches.
- **Monitoring** : Dashboard fonctionnel avec banniere d'alerte 24h, filtre echecs, bouton relancer, badge sidebar.
- **KPIs** : BriefingRoom affiche MRR, agents actifs, uptime, dernier run — mais sans protection si Stripe est down.
- **Autopilot** : Polling 5min fonctionnel, mais pas de debounce ni AbortController, pas de journal des decisions persistent.
- **Logging** : Table `hq.structured_logs` + RPCs existent, mais aucune edge function n'insere de logs.

---

## Sprint 1 : Securite et Synchronisation (Tickets 1 + 2)

### Ticket 1 — Securite : Documenter et fermer le badge

Le scan de securite confirme 0 vulnerabilite. Les "2 Errors" sont des choix architecturaux.

**Actions** :
- Mettre a jour la page Trust avec la date du dernier scan dynamique et un lien vers le rapport
- Ajouter des commentaires JSDoc dans `AICostWidget.tsx` et `AgentMonitoringDashboard.tsx` documentant les choix de securite
- Executer `security--manage_security_finding` pour confirmer les findings comme "ignores" si pas deja fait

### Ticket 2 — Synchroniser les 29 run types client / backend

4 run types du registre frontend n'existent pas dans l'edge function backend : `DEPLOY_TO_PRODUCTION`, `RLS_POLICY_UPDATE`, `MASS_EMAIL_CAMPAIGN`, `PRICING_CHANGE`.

**Actions** :
- Ajouter les 4 templates manquants dans `supabase/functions/executive-run/index.ts` avec system prompts, model config et steps
- Ajouter `DEPLOY_TO_PRODUCTION` et `RLS_POLICY_UPDATE` comme runs dangereux (model "reasoning", confirmation requise)
- Verifier que les 29 cles du registre correspondent exactement aux cles de `RUN_TEMPLATES`

**Fichiers** : `supabase/functions/executive-run/index.ts`

---

## Sprint 2 : Monitoring et Logging (Tickets 3 + 4)

### Ticket 3 — Dashboard Failed Runs renforce

Le dashboard a deja banniere + filtre + bouton relancer. Renforcements :

**Actions** :
- Afficher le `executive_summary` complet (pas seulement 150 chars) dans l'encart d'erreur expandee des runs echoues
- Ajouter un etat vide explicite "Aucun echec — tout fonctionne" avec icone CheckCircle quand le filtre echecs est actif et qu'il n'y a rien
- Afficher le `platform_key` dans le message d'erreur si disponible

**Fichiers** : `src/components/hq/AgentMonitoringDashboard.tsx`

### Ticket 4 — Logging production-grade dans l'edge function

La table et les RPCs existent. Il faut maintenant que l'edge function insere des logs.

**Actions** :
- Modifier `executive-run/index.ts` pour inserer un log `insert_hq_log` au debut (INFO, "run.started"), a la fin (INFO, "run.completed") et en cas d'erreur (ERROR, "run.failed")
- Inclure dans metadata : `run_type`, `platform_key`, `model_used`, `duration_ms`
- Creer un composant `StructuredLogsViewer.tsx` avec filtrage par niveau et source, affiche sur la page monitoring
- Ajouter une migration SQL pour purge automatique des logs de plus de 30 jours (trigger ou cron)

**Fichiers** : `supabase/functions/executive-run/index.ts`, nouveau `src/components/hq/diagnostics/StructuredLogsViewer.tsx`, `src/pages/hq/AgentsMonitoringPage.tsx`, migration SQL

---

## Sprint 3 : Fiabilite financiere et executive (Tickets 5 + 6)

### Ticket 5 — Cout IA fiabilise

`AICostWidget.tsx` utilise deja le registre. Renforcements :

**Actions** :
- Ajouter guards `|| 0` sur toutes les operations de calcul pour eviter NaN
- Ajouter un tooltip sur chaque barre du graphique montrant nombre de runs et cout moyen
- Ajouter le total mensuel en gros chiffre visible en haut du widget
- Verifier que les 29 run types sont couverts via `getRunCost()` (deja le cas avec fallback)

**Fichiers** : `src/components/hq/AICostWidget.tsx`

### Ticket 6 — KPIs executifs blindes

BriefingRoom affiche deja les 4 KPIs mais sans protection contre les erreurs.

**Actions** :
- Ajouter `isError` check sur `useStripeKPIs` — afficher "—" avec tooltip "Service indisponible" si erreur
- Ajouter null guards sur tous les calculs (mrr, activeAgents, uptime, lastRun)
- Ajouter un badge "Moyenne" a cote de l'uptime pour clarifier la methode de calcul
- Envelopper le bloc KPIs dans un try-catch React (ErrorBoundary local)

**Fichiers** : `src/pages/hq/BriefingRoom.tsx`

---

## Sprint 4 : Stabilite et Hardening (Tickets 7 + 8)

### Ticket 7 — Autopilot IA stabilise

Le polling 5 min fonctionne mais a des failles :

**Actions** :
- Ajouter un `AbortController` dans `useAIAutopilot` pour annuler les requetes si le composant se demonte
- Ajouter deduplication : verifier si un run du meme type est deja en `status = 'running'` avant de lancer (cote edge function)
- Ajouter un panneau "Journal des decisions IA" dans `SchedulerPanel.tsx` qui affiche les dernieres decisions avec reasoning (stockees dans `hq.structured_logs` via le ticket 4)
- Fixer la closure de `isDeciding` dans le useCallback (ajouter un ref au lieu d'un state pour eviter race condition)

**Fichiers** : `src/hooks/useAIScheduler.ts`, `supabase/functions/ai-scheduler/index.ts`, `src/components/hq/SchedulerPanel.tsx`

### Ticket 8 — Hardening UI et erreurs globales

ErrorBoundary existe deja dans `src/components/ErrorBoundary.tsx`. Renforcements :

**Actions** :
- Verifier que le ErrorBoundary global est bien applique dans `App.tsx` (wrap du Router)
- Ajouter un toast automatique quand une edge function retourne une erreur (centraliser dans `useExecuteRun`)
- Ajouter un fallback UI propre pour les composants individuels (monitoring, briefing) avec message "Impossible de charger ce module"
- Verifier le responsive mobile sur les pages Cockpit, Monitoring, BriefingRoom

**Fichiers** : `src/App.tsx`, `src/hooks/useHQData.ts`, `src/pages/hq/BriefingRoom.tsx`, `src/components/hq/AgentMonitoringDashboard.tsx`

---

## Details techniques

| Ticket | Priorite | Fichiers | Estimation |
|--------|----------|----------|------------|
| 1 | P0 | TrustPage.tsx | 0.5 msg |
| 2 | P0 | executive-run/index.ts | 0.5 msg |
| 3 | P1 | AgentMonitoringDashboard.tsx | 0.5 msg |
| 4 | P1 | Edge function + composant + migration | 1 msg |
| 5 | P1 | AICostWidget.tsx | 0.5 msg |
| 6 | P1 | BriefingRoom.tsx | 0.5 msg |
| 7 | P1 | Scheduler + edge function + panel | 1 msg |
| 8 | P2 | App.tsx + hooks + composants | 0.5 msg |

### Dependances
- Ticket 4 avant Ticket 7 (les logs sont utilises par le journal des decisions)
- Tickets 1+2 sont independants et peuvent etre faits en parallele

### Ordre d'execution
1. Tickets 1+2 (securite + sync run types)
2. Tickets 3+5 (failed runs + couts IA)
3. Ticket 4 (logging production)
4. Tickets 6+8 (KPIs blindes + hardening UI)
5. Ticket 7 (autopilot stabilise)

**Total estime : 5 messages.**

