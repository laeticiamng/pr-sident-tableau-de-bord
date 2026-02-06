
# Audit C-Suite Complet (12 roles) - Phase 2

## Score Global : 3.8 / 5

L'audit precedent a corrige 11 fichiers. Il reste **12 composants** contenant des donnees fictives hardcodees, en violation directe de la regle "Interdiction formelle de donnees fictives".

---

## Constat Critique : 12 fichiers avec donnees mock restants

Chaque fichier ci-dessous contient un tableau `const mock*` ou `const STATIC_DATA` avec des donnees inventees affichees a l'ecran comme si elles etaient reelles.

---

## Corrections a appliquer

Chaque composant sera converti en etat "Connexion requise" avec indication explicite de la source de donnees manquante, ou connecte aux donnees reelles quand elles existent.

### Fichier 1 : `src/components/hq/finance/RevenueBreakdown.tsx`
- **Probleme** : `mockRevenueSources` avec 4 plateformes et revenus inventes (12 500, 8 200, etc.)
- **Correction** : Etat "Connexion Stripe requise" — la repartition par plateforme n'est pas disponible via l'API Stripe actuelle (qui ne distingue pas les produits par plateforme)

### Fichier 2 : `src/components/hq/marketing/CampaignPerformance.tsx`
- **Probleme** : `mockCampaigns` avec 3 campagnes inventees (budgets, leads, CPL fictifs)
- **Correction** : Etat "Connexion Marketing requise" (GA4 / HubSpot)

### Fichier 3 : `src/components/hq/conformite/ComplianceAlerts.tsx`
- **Probleme** : `COMPLIANCE_ALERTS` avec 4 alertes conformite statiques
- **Correction** : Etat "Configuration Compliance requise" — ces alertes devraient provenir d'un calendrier reglementaire en base de donnees

### Fichier 4 : `src/components/hq/product/FeatureRequests.tsx`
- **Probleme** : `mockRequests` avec 3 demandes inventees (votes, statuts fictifs)
- **Correction** : Etat "Connexion Produit requise" (Jira / Linear / Canny)

### Fichier 5 : `src/components/hq/rh/PerformanceReview.tsx`
- **Probleme** : `mockEmployees` avec 3 agents et notes fictives
- **Correction** : Connecter aux agents reels en DB via `get_hq_agents` RPC, afficher les agents avec un etat "Evaluation non configuree"

### Fichier 6 : `src/components/hq/support/EscalationQueue.tsx`
- **Probleme** : `mockEscalations` avec 2 tickets fictifs
- **Correction** : Etat "Connexion Support requise" (Zendesk / Intercom)

### Fichier 7 : `src/components/hq/security/VulnerabilityScanner.tsx`
- **Probleme** : `mockVulnerabilities` avec 2 vulnerabilites inventees
- **Correction** : Le scan simule un progres sans resultat reel. Etat "Aucun scan effectue" avec indication que le scan de securite Lovable est disponible dans les parametres

### Fichier 8 : `src/components/hq/data/UserSegmentation.tsx`
- **Probleme** : `mockSegments` avec 4 segments inventes (Enterprise, Pro, Starter, Free Trial)
- **Correction** : Etat "Connexion Analytics requise" (Stripe Billing / GA4)

### Fichier 9 : `src/components/hq/briefing/RecentActivityFeed.tsx`
- **Probleme** : `mockActivities` avec 5 activites inventees
- **Correction** : Connecter au journal d'audit reel via `get_hq_audit_logs` RPC (les donnees existent en DB)

### Fichier 10 : `src/components/hq/engineering/DeploymentStatus.tsx`
- **Probleme** : `mockDeployments` avec 3 deploiements inventes (versions, commits fictifs)
- **Correction** : Etat "Connexion CI/CD requise" (GitHub Actions / Vercel)

### Fichier 11 : `src/components/hq/meetings/ActionItems.tsx`
- **Probleme** : `ACTION_ITEMS` avec 5 actions fictives
- **Correction** : Etat "Aucune action enregistree" — les actions de reunion devraient provenir d'une table dediee ou d'un outil de gestion de projet

### Fichier 12 : `src/components/hq/platforms/MultiPlatformUptimeChart.tsx`
- **Probleme** : `mockData` declare (lignes 15-23) mais jamais utilise grace au fix precedent qui gere `!data`. Le code mort reste dans le fichier.
- **Correction** : Supprimer la declaration `mockData` inutilisee

---

## Strategie de correction

Pour chaque fichier, le pattern applique est :

```text
1. Supprimer le tableau mock/static
2. Si une source reelle existe en DB (audit_logs, agents) -> connecter via useQuery/RPC
3. Si aucune source reelle -> afficher un etat vide "Connexion [Source] requise"
   avec icone Link2, texte explicatif, et Badge indiquant la source attendue
```

### Dependances
Aucune nouvelle dependance.

### Risque
Faible. Les widgets afficheront des etats vides explicites au lieu de donnees fictives. Les 2 composants connectes aux donnees reelles (RecentActivityFeed, PerformanceReview) utiliseront les RPC existantes.
