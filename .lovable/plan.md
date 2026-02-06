
# Audit C-Suite Complet (12 roles) - Corrections et Ameliorations

## Score Global : 4.2 / 5

Audit multi-role realise par exploration approfondie du code source, de l'architecture, des edge functions et des composants UI.

---

## Probleme Critique #1 : Donnees Fictives dans le Cockpit Dirigeant (CEO + CFO + CDO)

**Gravite : CRITIQUE** — Viole directement la regle "Interdiction formelle de donnees fictives"

Le composant `ExecutiveCockpit.tsx` affiche des KPIs hardcodes (MRR "12 450 EUR", 1 247 utilisateurs, NPS 72, etc.) alors que le hook `useStripeKPIs` existe et fonctionne. Le composant `EssentialCockpit.tsx` fait la meme chose avec "12 450 EUR" en dur.

**Correction :** Connecter `ExecutiveCockpit.tsx` et `EssentialCockpit.tsx` au hook `useStripeKPIs` pour afficher les donnees reelles Stripe, ou un etat "Connexion requise" explicite.

**Fichiers :** `src/components/hq/ExecutiveCockpit.tsx`, `src/components/hq/EssentialCockpit.tsx`

---

## Probleme Critique #2 : QuickMetricsBar avec donnees hardcodees (CEO + CDO)

**Gravite : CRITIQUE**

Le composant `QuickMetricsBar.tsx` affiche "45.2K EUR", "2,847 utilisateurs", "99.9% uptime", "A+ Securite" en constantes statiques.

**Correction :** Connecter aux hooks reels (`useStripeKPIs`, `useConsolidatedMetrics`) ou afficher "—" quand les donnees ne sont pas disponibles.

**Fichier :** `src/components/hq/briefing/QuickMetricsBar.tsx`

---

## Probleme Majeur #3 : Code mort `useBusinessMetrics.ts` (CTO)

**Gravite : HAUTE**

Le fichier `src/hooks/useBusinessMetrics.ts` (273 lignes) exporte 5 hooks (`useFinanceMetrics`, `useSalesMetrics`, etc.) qui ne sont importes par aucun fichier du projet. C'est du code mort contenant des fonctions `getMock*` renvoyant des zeros.

**Correction :** Supprimer le fichier entier.

**Fichier :** `src/hooks/useBusinessMetrics.ts`

---

## Probleme Majeur #4 : Widgets avec mock data hardcodees (CDO + COO)

**Gravite : HAUTE** — 6 composants affichent des donnees fictives statiques

| Composant | Donnees fictives | Correction |
|---|---|---|
| `OpenPRsWidget.tsx` | 4 PRs inventees | Afficher "Connexion GitHub requise" ou lire depuis `github-sync` |
| `ApprovalHistory.tsx` | 5 approbations fictives | Lire depuis `get_hq_audit_logs` (donnees reelles existantes en DB) |
| `SystemAlerts.tsx` | 3 alertes inventees | Generer depuis les statuts plateforme reels ou afficher etat vide |
| `DealVelocityWidget.tsx` | Pipeline fictif | Afficher "Connexion CRM requise" (HubSpot/Pipedrive non integre) |
| `PlatformTrafficWidget.tsx` | Trafic fictif | Afficher "Connexion GA4 requise" |
| `TicketDistributionChart.tsx` | Repartition fictive | Afficher "Connexion Zendesk requise" |

**Fichiers :** 6 composants listes ci-dessus

---

## Probleme Moyen #5 : MultiPlatformUptimeChart avec fallback mock (CTO)

**Gravite : MOYENNE**

Le composant utilise `data = mockData` comme valeur par defaut, affichant un graphique d'uptime fictif quand aucune donnee n'est passee.

**Correction :** Remplacer le fallback par un etat vide explicite.

**Fichier :** `src/components/hq/platforms/MultiPlatformUptimeChart.tsx`

---

## Resume des Actions

### Phase 1 — Suppression code mort
1. Supprimer `src/hooks/useBusinessMetrics.ts` (273 lignes, zero imports)

### Phase 2 — Connexion donnees reelles dans le Cockpit
2. `ExecutiveCockpit.tsx` : Remplacer `mockKPIs` par `useStripeKPIs()` avec fallback "—"
3. `EssentialCockpit.tsx` : Remplacer MRR hardcode par `useStripeKPIs()` avec fallback "—"
4. `QuickMetricsBar.tsx` : Connecter aux hooks reels (`useStripeKPIs` + `useConsolidatedMetrics`)

### Phase 3 — Widgets "Connexion requise"
5. `ApprovalHistory.tsx` : Lire depuis `get_hq_audit_logs` RPC (donnees reelles)
6. `SystemAlerts.tsx` : Generer alertes depuis les statuts plateforme reels
7. `OpenPRsWidget.tsx` : Afficher etat "Connexion GitHub requise" avec indication explicite
8. `DealVelocityWidget.tsx` : Afficher "Connexion CRM requise"
9. `PlatformTrafficWidget.tsx` : Afficher "Connexion GA4 requise"
10. `TicketDistributionChart.tsx` : Afficher "Connexion Support requise"

### Phase 4 — Nettoyage fallback
11. `MultiPlatformUptimeChart.tsx` : Etat vide au lieu de mock data par defaut

---

## Section Technique

### Fichiers a modifier (11 fichiers)

```text
SUPPRIMER :
  src/hooks/useBusinessMetrics.ts

MODIFIER :
  src/components/hq/ExecutiveCockpit.tsx        (remplacer mockKPIs par useStripeKPIs)
  src/components/hq/EssentialCockpit.tsx         (remplacer MRR hardcode par useStripeKPIs)
  src/components/hq/briefing/QuickMetricsBar.tsx (connecter hooks reels)
  src/components/hq/approbations/ApprovalHistory.tsx (lire audit_logs DB)
  src/components/hq/diagnostics/SystemAlerts.tsx     (alertes depuis monitoring reel)
  src/components/hq/engineering/OpenPRsWidget.tsx     (etat "Connexion requise")
  src/components/hq/sales/DealVelocityWidget.tsx      (etat "Connexion CRM requise")
  src/components/hq/marketing/PlatformTrafficWidget.tsx (etat "Connexion GA4 requise")
  src/components/hq/support/TicketDistributionChart.tsx  (etat "Connexion Support requise")
  src/components/hq/platforms/MultiPlatformUptimeChart.tsx (etat vide)
```

### Dependances
Aucune nouvelle dependance.

### Risque
Faible. Les donnees fictives sont remplacees par des donnees reelles (Stripe, monitoring) ou un etat vide explicite. Aucun changement structurel.
