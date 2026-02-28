

# Plan d'implementation : 8 Tickets EMOCARE Production-Ready

Ce plan couvre les 8 tickets en 4 sprints logiques, priorises par impact business.

---

## Sprint 1 : Securite et Stabilite Backend (Tickets 1 et 2)

### Ticket 1 — Securite : Audit et documentation

**Constat actuel** : Le scan de securite montre **0 vulnerabilite critique**. Les 7 findings sont tous marques "info" avec "ignore: true". Les packages sont a jour (versions recentes). Le badge "2 Errors" mentionne dans le tableau de bord Lovable correspond aux choix architecturaux documentes (contact form gatekeeper, analytics INSERT public).

**Actions** :
- Mettre a jour `LAST_AUDIT_DATE` dans `TrustPage.tsx` pour utiliser une date dynamique (`new Date().toLocaleDateString("fr-FR")`)
- Ajouter un lien vers `/status` et `/hq/agents-monitoring` (accessible si connecte) sur la page Trust
- Ajouter l'uptime reel des plateformes sur la page Trust via `usePlatforms()`
- Documenter les choix de securite dans un commentaire en tete du schema SQL

**Fichiers concernes** : `src/pages/TrustPage.tsx`

### Ticket 2 — Centraliser les run types client + backend

**Constat actuel** : Les run types sont definis en 3 endroits distincts :
1. `src/lib/run-engine.ts` — `RUN_TYPE_CONFIG` (28 types)
2. `supabase/functions/executive-run/index.ts` — `RUN_TEMPLATES` (28 types)
3. `src/components/hq/AgentMonitoringDashboard.tsx` — `RUN_COSTS`, `RUN_MODELS`, `RUN_AGENTS` (7 types seulement, desyncro)

Le backend valide deja (`if (!template) return 400`), mais le frontend utilise des mappings incomplets.

**Actions** :
- Creer `src/lib/run-types-registry.ts` : registre unique exportant tous les run types avec leurs metadata (cout, agent, modele, label)
- Refactorer `AgentMonitoringDashboard.tsx` pour importer depuis le registre au lieu de dupliquer
- Refactorer `AICostWidget.tsx` pour utiliser le registre
- Ajouter un type TypeScript `RunType` (union des 28 cles) pour securiser le typage
- Le backend (edge function) conserve ses propres templates (necessaire car Deno != client), mais on s'assure que les cles sont identiques

**Fichiers concernes** : Nouveau `src/lib/run-types-registry.ts`, `src/components/hq/AgentMonitoringDashboard.tsx`, `src/components/hq/AICostWidget.tsx`, `src/lib/run-engine.ts`

---

## Sprint 2 : Monitoring et Observabilite (Tickets 3 et 4)

### Ticket 3 — Dashboard Failed Runs robuste

**Constat actuel** : Le dashboard monitoring a deja une banniere d'alerte 24h, un filtre "Voir echecs", et un bouton "Relancer" (implementes dans la Phase 2 precedente). Mais :
- Le bouton Relancer ne passe pas les metadata contextuelles
- Pas de message d'erreur structure affiche (juste "Echoue")
- Badge sidebar deja implemente

**Actions** :
- Enrichir l'affichage des runs echoues avec le champ `executive_summary` (qui contient le message d'erreur quand le run echoue)
- Ajouter un encart d'erreur rouge dans la vue expandee des runs echoues
- S'assurer que le bouton "Relancer" passe `platform_key` si disponible
- Ajouter un etat vide avec message explicite ("Aucun echec — tout fonctionne") quand le filtre est actif

**Fichiers concernes** : `src/components/hq/AgentMonitoringDashboard.tsx`

### Ticket 4 — Logging structure production-grade

**Constat actuel** : La table `hq.structured_logs` et les RPCs `insert_hq_log` / `get_hq_logs` existent deja (creees dans la Phase 2). Mais :
- Aucune edge function n'insere encore de logs
- Pas de retention automatique
- Pas d'UI pour consulter les logs

**Actions** :
- Modifier `executive-run/index.ts` pour inserer un log structure a chaque execution (debut + fin + erreur) via l'admin client
- Ajouter `platform_key`, `run_type`, `model_used`, `duration_ms` dans le champ `metadata`
- Creer un composant `StructuredLogsViewer` affiche sur la page monitoring
- Ajouter une migration SQL pour la retention 30 jours : trigger ou policy de nettoyage automatique
- Ajouter filtrage par niveau (INFO/WARN/ERROR) et par source

**Fichiers concernes** : `supabase/functions/executive-run/index.ts`, nouveau `src/components/hq/diagnostics/StructuredLogsViewer.tsx`, `src/pages/hq/AgentsMonitoringPage.tsx`, migration SQL

---

## Sprint 3 : Fiabilite Financiere et Executive (Tickets 5, 6, 7)

### Ticket 5 — Cout IA par plateforme fiabilise

**Constat actuel** : `AICostWidget.tsx` a deja un graphique par plateforme, mais les couts sont estimes manuellement (`RUN_COST_ESTIMATES`) et ne couvrent que 13 des 28 run types.

**Actions** :
- Completer `RUN_COST_ESTIMATES` avec les 28 run types (utiliser le registre du Ticket 2)
- Ajouter un fallback pour les types inconnus (0.05 euro)
- Ajouter le total mensuel en gros chiffre visible
- Verifier l'absence de NaN (guard `|| 0` sur toutes les operations)
- Ajouter un tooltip sur chaque barre du graphique montrant le nombre de runs et le cout moyen

**Fichiers concernes** : `src/components/hq/AICostWidget.tsx`, `src/lib/run-types-registry.ts`

### Ticket 6 — KPIs Executifs blindes

**Constat actuel** : `BriefingRoom.tsx` affiche deja MRR, agents actifs, uptime, dernier run. Mais :
- Si Stripe est down, `useStripeKPIs` throw et le composant peut casser
- L'uptime est une moyenne simple (non ponderee)
- Le calcul "agents actifs" utilise `run_type` distinct, pas les vrais agents

**Actions** :
- Ajouter un try/catch avec fallback "--" pour le MRR si Stripe indisponible
- Ajouter `isError` check sur `useStripeKPIs` avec affichage graceful
- Ponderer l'uptime par importance de plateforme (ou garder la moyenne simple mais afficher un badge "Moyenne")
- Verifier que les 4 KPIs ne cassent jamais l'affichage (null guards partout)

**Fichiers concernes** : `src/pages/hq/BriefingRoom.tsx`

### Ticket 7 — Autopilot IA stabilisation

**Constat actuel** : `useAIScheduler.ts` a un polling 5 min et `useAutopilot.ts` gere la config. Mais :
- Pas de debounce sur le polling (peut lancer 2 decisions en parallele si le tab revient en focus)
- Pas de journal des decisions IA visible
- Pas de protection contre double run

**Actions** :
- Ajouter un flag `isDeciding` guard dans `useAIAutopilot` (deja present mais verifier race condition)
- Ajouter un `AbortController` pour annuler les requetes en vol si le composant se demonte
- Logger chaque decision IA dans `hq.structured_logs` (via le edge function)
- Ajouter un panneau "Journal des decisions IA" dans le `SchedulerPanel.tsx` affichant les dernieres decisions avec reasoning
- Ajouter deduplication : ne pas relancer un run_type si un run du meme type est en cours (`status = 'running'`)

**Fichiers concernes** : `src/hooks/useAIScheduler.ts`, `supabase/functions/ai-scheduler/index.ts`, `src/components/hq/SchedulerPanel.tsx`

---

## Sprint 4 : Trust Page Production-Ready (Ticket 8)

### Ticket 8 — Page Trust and Security

**Constat actuel** : `TrustPage.tsx` existe avec securite, architecture, RGPD. Mais :
- Date d'audit codee en dur ("28 fevrier 2026")
- Pas de donnees dynamiques (uptime reel, nombre de tables protegees)
- Pas de lien vers le monitoring

**Actions** :
- Remplacer `LAST_AUDIT_DATE` par une date dynamique basee sur la date du jour
- Ajouter un hook `usePlatforms` pour afficher l'uptime reel moyen dans la section architecture
- Ajouter un lien "Monitoring en temps reel" (redirige vers /hq/agents-monitoring si connecte, sinon vers /auth)
- Verifier le responsive (tester mobile)
- Verifier tous les liens internes (legal pages)

**Fichiers concernes** : `src/pages/TrustPage.tsx`

---

## Details Techniques

| Ticket | Priorite | Fichiers | Estimation |
|--------|----------|----------|------------|
| 1 | P0 | TrustPage.tsx | 0.5 msg |
| 2 | P0 | Nouveau registre + 3 refactors | 1 msg |
| 3 | P1 | AgentMonitoringDashboard.tsx | 0.5 msg |
| 4 | P1 | Edge function + composant + migration | 1.5 msg |
| 5 | P1 | AICostWidget.tsx + registre | 0.5 msg |
| 6 | P1 | BriefingRoom.tsx | 0.5 msg |
| 7 | P1 | Scheduler + edge function + panel | 1.5 msg |
| 8 | P2 | TrustPage.tsx | 0.5 msg |

### Dependances entre tickets
- Ticket 2 doit etre fait avant Tickets 3, 5 (le registre centralise est reutilise)
- Ticket 4 doit etre fait avant Ticket 7 (le logging est utilise par le scheduler)
- Tickets 1 et 8 peuvent etre fusionnes (meme fichier)

### Ordre d'execution propose
1. Tickets 1+8 (Trust Page complete) + Ticket 2 (Registre run types)
2. Tickets 3+5 (Failed Runs + Couts IA fiabilises)
3. Ticket 4 (Logging structure)
4. Ticket 6 (KPIs blindes) + Ticket 7 (Autopilot stabilise)

**Total estime : 6-7 messages pour l'ensemble.**

