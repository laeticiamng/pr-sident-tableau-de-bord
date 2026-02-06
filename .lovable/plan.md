

# Audit C-Suite Phase 3 - Elimination finale des donnees fictives

## Score Global : 4.2 / 5

Phases 1 et 2 ont corrige 23 fichiers. Il reste **20 composants** contenant des donnees fictives hardcodees.

---

## Inventaire des 20 fichiers restants

### Categorie A : Composants avec donnees fictives presentees comme reelles (CRITIQUE - 14 fichiers)

Ces composants affichent des chiffres inventes sans aucune indication qu'il s'agit de donnees fictives.

| # | Fichier | Donnees fictives | Correction |
|---|---------|-----------------|------------|
| 1 | `entreprise/StrategicGoals.tsx` | 3 objectifs OKR inventes (72%, 45%, 88%) | Etat vide "Aucun objectif configure" |
| 2 | `entreprise/QuarterlyObjectives.tsx` | 5 objectifs Q1 inventes (MRR 45200, etc.) | Etat vide "Aucun objectif Q1 configure" |
| 3 | `diagnostics/LiveActivityStream.tsx` | `generateMockEvent()` generant des evenements aleatoires en boucle | Connecter aux audit_logs reels via Supabase Realtime ou afficher etat vide |
| 4 | `marketing/ContentCalendar.tsx` | 6 contenus inventes (articles, posts, webinars) | Etat vide "Calendrier non configure" |
| 5 | `engineering/PullRequestsWidget.tsx` | 4 PRs inventees (titres, repos, auteurs fictifs) | Etat vide "Connexion GitHub requise" |
| 6 | `support/TicketTrendChart.tsx` | 5 semaines de tendance tickets inventees | Etat vide "Connexion Support requise" |
| 7 | `support/SLAMonitor.tsx` | 4 metriques SLA inventees (95%, 92%, etc.) | Etat vide "Connexion Support requise" |
| 8 | `rh/OnboardingTracker.tsx` | 5 agents onboarding inventes | Connecter aux agents reels via `get_hq_agents` |
| 9 | `rh/TrainingCompletionWidget.tsx` | 5 modules de formation inventes | Etat vide "Aucune formation configuree" |
| 10 | `rh/TeamPerformanceMetrics.tsx` | 4 metriques performance inventees (1247 taches, etc.) | Etat vide "Metriques non disponibles" |
| 11 | `sales/WinLossWidget.tsx` | Pipeline fictif (24 wins, 8 losses, 4850 EUR) | Etat vide "Connexion CRM requise" |
| 12 | `meetings/MeetingNotes.tsx` | 3 comptes-rendus inventes | Etat vide "Aucune note de reunion" |
| 13 | `meetings/UpcomingMeetings.tsx` | 4 reunions inventees | Etat vide "Aucune reunion planifiee" |
| 14 | `meetings/ParticipationIndicator.tsx` | Taux de participation inventes (94%, etc.) | Etat vide "Donnees de participation non disponibles" |

### Categorie B : Graphiques/Charts avec donnees par defaut fictives (MAJEUR - 6 fichiers)

Ces composants acceptent des `data` en props mais ont un fallback DEFAULT_DATA fictif.

| # | Fichier | Donnees fictives | Correction |
|---|---------|-----------------|------------|
| 15 | `charts/ConversionFunnelChart.tsx` | DEFAULT_FUNNEL (10000 visiteurs, 2500 inscriptions...) | Remplacer default par `[]` + etat vide |
| 16 | `charts/ARPUTrendChart.tsx` | DEFAULT_DATA (6 mois ARPU invente) | Remplacer default par `[]` + etat vide |
| 17 | `charts/MRRChart.tsx` | DEFAULT_DATA (6 mois MRR invente) | Remplacer default par `[]` + etat vide |
| 18 | `data/LTVSegmentChart.tsx` | SEGMENT_DATA (Enterprise 2400, Pro 890...) | Etat vide "Connexion Analytics requise" |
| 19 | `data/CohortRetentionTable.tsx` | DEFAULT_COHORT_DATA (5 cohortes inventees) | Remplacer default par `[]` + etat vide |
| 20 | `data/CohortAnalysis.tsx` | COHORT_DATA (5 cohortes inventees) | Etat vide "Connexion Analytics requise" |
| | `data/FeatureAdoptionChart.tsx` | FEATURE_USAGE_DATA (8 features inventees) | Etat vide "Donnees d'adoption non disponibles" |
| | `platforms/PlatformUptimeChart.tsx` | DEFAULT_DATA (7 jours uptime invente) | Remplacer default par `[]` + etat vide |
| | `finance/CashFlowForecast.tsx` | DEFAULT_DATA (5 mois cashflow invente) | Remplacer default par `[]` + etat vide |
| | `finance/UnitEconomicsDisplay.tsx` | DEFAULT_DATA (CAC 52, LTV 487...) | Supprimer default, exiger data en props |

**Note** : Le total reel est 24 fichiers a corriger (14 categorie A + 10 categorie B).

---

### Composant deja correct (pas de mock)

- `security/SecretsRegistry.tsx` : Les noms de secrets sont des constantes legitimes (liste reelle des secrets configures dans le projet)
- `security/RLSAuditTable.tsx` : Les tables HQ listees sont les vraies tables du schema `hq`
- `product/OKRProgress.tsx` : Deja corrige, affiche etat vide "Aucun OKR configure"
- `charts/SalesPipelineChart.tsx` : Deja corrige, default a `[]` avec etat vide

---

## Strategie de correction

Le pattern uniforme applique a chaque fichier :

```text
1. Supprimer le tableau const MOCK/DEFAULT_DATA
2. Si une source reelle existe en DB -> connecter via useQuery/RPC
3. Sinon -> afficher un etat vide avec :
   - Icone Database ou Link2
   - Titre "Connexion [Source] requise" ou "Aucune donnee configuree"
   - Badge indiquant la source attendue
   - Style border-dashed border-2 border-muted-foreground/20
```

Pour les composants acceptant `data` en props (charts) :
- Changer le default de `data = DEFAULT_DATA` a `data` (optionnel)
- Ajouter un rendu conditionnel si `!data || data.length === 0`

### Connexions reelles possibles (2 fichiers)
- `OnboardingTracker.tsx` : connecter a `get_hq_agents` RPC
- `LiveActivityStream.tsx` : connecter a `get_hq_audit_logs` RPC avec polling

---

## Section Technique

### Fichiers a modifier (24 fichiers)

```text
src/components/hq/entreprise/StrategicGoals.tsx
src/components/hq/entreprise/QuarterlyObjectives.tsx
src/components/hq/diagnostics/LiveActivityStream.tsx
src/components/hq/marketing/ContentCalendar.tsx
src/components/hq/engineering/PullRequestsWidget.tsx
src/components/hq/support/TicketTrendChart.tsx
src/components/hq/support/SLAMonitor.tsx
src/components/hq/rh/OnboardingTracker.tsx
src/components/hq/rh/TrainingCompletionWidget.tsx
src/components/hq/rh/TeamPerformanceMetrics.tsx
src/components/hq/sales/WinLossWidget.tsx
src/components/hq/meetings/MeetingNotes.tsx
src/components/hq/meetings/UpcomingMeetings.tsx
src/components/hq/meetings/ParticipationIndicator.tsx
src/components/hq/charts/ConversionFunnelChart.tsx
src/components/hq/charts/ARPUTrendChart.tsx
src/components/hq/charts/MRRChart.tsx
src/components/hq/data/LTVSegmentChart.tsx
src/components/hq/data/CohortRetentionTable.tsx
src/components/hq/data/CohortAnalysis.tsx
src/components/hq/data/FeatureAdoptionChart.tsx
src/components/hq/platforms/PlatformUptimeChart.tsx
src/components/hq/finance/CashFlowForecast.tsx
src/components/hq/finance/UnitEconomicsDisplay.tsx
```

### Dependances
Aucune nouvelle dependance.

### Risque
Faible. Les widgets afficheront des etats vides explicites. Les 2 composants connectes aux donnees reelles (OnboardingTracker, LiveActivityStream) utiliseront les RPC existantes deja testees.
