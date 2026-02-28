
# Plan Stratégique : EMOCARE Production-Ready

Ce plan traite les 7 axes que vous avez identifiés, priorisés par impact business.

---

## Phase 1 : Securite (P0 -- Urgence)

### 1.1 Corriger les findings de securite
Le scan de securite revele 4 findings :
- **Extension in Public** (warn) : Deja documente, risque faible
- **RLS Policy Always True** (warn) : La table `analytics_events` a un INSERT `true` -- c'est un choix architectural documente (tracking anonyme)
- **Contact Form INSERT manquant** (error) : Les messages passent par l'Edge Function gatekeeper -- c'est aussi un choix documente
- **Analytics UPDATE manquant** (info) : Correct par design, les events ne doivent pas etre modifies

**Conclusion** : Aucune vulnerabilite critique reelle. Les 2 "erreurs" sont des choix architecturaux deja documentes. On ajoutera un commentaire de documentation dans le code pour clarifier.

### 1.2 Page "Trust and Security" publique
Creer une nouvelle page `/trust` accessible publiquement :
- Affiche les mesures de securite (RLS, chiffrement AES-256, isolation schema)
- Conformite RGPD avec liens vers les pages legales existantes
- Architecture de securite simplifiee (sans jargon)
- Badge "Derniere verification" avec date
- Lien depuis le footer public et la navigation

---

## Phase 2 : Monitoring and Observabilite (P1)

### 2.1 Table de logs structures persistants
Creer une table `hq.structured_logs` via migration :
```text
id, level (info/warn/error/critical), source (edge_function/agent/system),
message, metadata (jsonb), run_id (nullable FK), created_at
```
Avec RLS owner-only et une RPC `insert_hq_log` (SECURITY DEFINER).

### 2.2 Dashboard "Failed Runs" dedie
Ajouter une section dans `AgentMonitoringDashboard.tsx` :
- Filtre sur `status = 'failed'`
- Affiche le message d'erreur, le run_type, l'agent, la date
- Bouton "Relancer" pour chaque run echoue
- Compteur visible dans la sidebar (badge rouge)

### 2.3 Cout IA par plateforme
Modifier `AICostWidget.tsx` pour ventiler les couts par `platform_key` :
- Graphique en barres horizontales (recharts) par plateforme
- Comparaison mois precedent
- Top 3 plateformes les plus couteuses

### 2.4 Alertes automatiques sur erreurs
Ajouter dans `AgentMonitoringDashboard.tsx` :
- Detection des runs echoues dans les 24h
- Banniere d'alerte en haut de page si runs echoues > 0
- Notification dans `NotificationCenter` pour chaque echec

---

## Phase 3 : KPIs Executifs sur Home HQ (P1)

### 3.1 Enrichir le BriefingRoom
Ajouter sur `/hq` (BriefingRoom.tsx) :
- **MRR en temps reel** depuis `useStripeKPIs`
- **Agents actifs** (nombre d'agents ayant execute un run dans les 24h)
- **Uptime global** (moyenne des uptimes des 7 plateformes)
- **Dernier run** avec statut et heure

Ces 4 metriques s'affichent dans une grille compacte entre le hero et les 3 actions.

---

## Phase 4 : UX Mobile (P2)

### 4.1 Audit et corrections mobile
- Verifier le responsive de `BriefingRoom`, `CockpitPage`, `AgentMonitoringDashboard`
- Corriger les debordements de badges/grilles sur petits ecrans
- S'assurer que le sidebar mobile se ferme correctement apres navigation (deja implementee)
- Tester le dialog agent sur mobile (ScrollArea + taille dialog)

---

## Phase 5 : Performance and Scalabilite (P2)

### 5.1 Pagination historique runs
Modifier `useRecentRuns` et la RPC `get_hq_recent_runs` :
- Ajouter un parametre `offset` a la RPC
- Implementer un bouton "Charger plus" dans l'historique
- Limiter l'affichage initial a 20 runs

### 5.2 Optimisation requetes
- Ajouter un index DB sur `hq.runs(run_type, created_at DESC)` via migration
- Ajouter `staleTime` et `gcTime` aux hooks critiques pour reduire les refetches

---

## Phase 6 : Alignement Strategique (P2)

### 6.1 Mettre en avant la page /status
- Ajouter un lien "Statut des services" dans le footer public (si absent)
- Ajouter un badge "Statut" dans la navigation publique

### 6.2 Roadmap visible
La page `/hq/produit` existe deja avec `ReleaseTimeline` et `OKRProgress`. Verifier qu'elle est complete et fonctionnelle.

---

## Details Techniques

| Changement | Fichiers concernes |
|---|---|
| Page Trust and Security | Nouveau : `src/pages/TrustPage.tsx`, editer `App.tsx`, `PublicFooter.tsx`, `PublicHeader.tsx` |
| Table structured_logs | Migration SQL, nouvelle RPC |
| Dashboard Failed Runs | `AgentMonitoringDashboard.tsx` |
| Cout IA par plateforme | `AICostWidget.tsx` |
| Alertes erreurs | `AgentMonitoringDashboard.tsx`, `NotificationCenter.tsx` |
| KPIs Home HQ | `BriefingRoom.tsx` |
| Pagination runs | `useHQData.ts`, migration SQL (offset param), `AgentMonitoringDashboard.tsx` |
| Index DB | Migration SQL |
| Corrections mobile | Multiples fichiers UI |

### Estimation
- Phase 1 : 1 message
- Phase 2 : 2-3 messages
- Phase 3 : 1 message
- Phase 4-6 : 2 messages

**Total : ~6-7 messages pour l'ensemble du plan.**
