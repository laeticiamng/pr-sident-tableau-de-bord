

# Audit C-Suite Phase 5 — Corrections finales

## Score Global : 4.8 / 5

Les phases 1 a 4 ont corrige 53 fichiers. L'audit identifie **1 derniere violation de donnees fictives** et **3 ameliorations UX/structurelles**.

---

## 1. Derniere violation mock data

### `src/components/hq/entreprise/CompanyKPIs.tsx`
- **Probleme** : `COMPANY_KPIS` contient des valeurs inventees presentees comme reelles :
  - `totalUsers: 1247` (fictif)
  - `monthlyGrowth: 12.5` (fictif)
  - `objectives: { completed: 8, total: 12, progress: 67 }` (fictif)
  - `milestones` avec dates/statuts inventes
- **Valeurs legitimes a conserver** : `founded: "2025-05-15"`, `platforms: 5` (constantes reelles)
- **Correction** : 
  - Connecter `totalUsers` (clients Stripe) via `useStripeKPIs`
  - Connecter `agents` via `get_hq_agents` RPC (nombre reel d'agents en DB)
  - Remplacer `monthlyGrowth` par le `mrrChange` reel de Stripe
  - Remplacer `objectives` et `milestones` par un etat "Aucun objectif configure" (ces donnees n'existent dans aucune source reelle)

---

## 2. Ameliorations UX (Head of Design / Beta testeur)

### 2a. Sidebar : routes "Bientot" qui fonctionnent deja
- **Probleme** : `COMING_SOON_ROUTES` dans `HQSidebar.tsx` marque 7 routes comme "Bientot" alors qu'elles sont toutes fonctionnelles (Ventes, Marketing, Support, Reunions, RH, Data, Conformite)
- **Correction** : Supprimer le tableau `COMING_SOON_ROUTES` et les badges "Bientot" associes

### 2b. Page publique d'accueil visible au lieu du HQ
- **Constat** : L'utilisateur est actuellement sur `/` (page marketing publique). Pour un outil de gouvernance interne, le dirigeant devrait atterrir directement sur le cockpit apres connexion. Ce n'est pas un bug — la page publique est necessaire pour les prospects — mais l'experience de l'utilisateur connecte pourrait etre amelioree.
- **Pas de modification** : La structure actuelle est correcte (ProtectedRoute redirige vers /auth si non connecte, et le HQ est accessible via /hq)

---

## Section Technique

### Fichiers a modifier (2 fichiers)

```text
src/components/hq/entreprise/CompanyKPIs.tsx    (connecter donnees reelles Stripe + agents DB)
src/components/layout/HQSidebar.tsx             (supprimer COMING_SOON_ROUTES)
```

### Detail des modifications

**CompanyKPIs.tsx** :
- Importer `useStripeKPIs` et `useAgents` (de useHQData)
- Remplacer `totalUsers` par `stripeKPIs.totalCustomers`
- Remplacer `agents: 37` par le nombre reel d'agents depuis la DB
- Remplacer `monthlyGrowth` par `stripeKPIs.mrrChange`
- Remplacer les sections Objectifs et Milestones par des etats vides "Non configure" avec style border-dashed

**HQSidebar.tsx** :
- Supprimer la constante `COMING_SOON_ROUTES` (lignes 34-42)
- Supprimer la condition `isComingSoon` et le Badge "Bientot" dans le rendu

### Dependances
Aucune nouvelle dependance.

### Risque
Faible. CompanyKPIs affichera des donnees reelles (Stripe + agents DB) avec fallback "—" si non connecte. La sidebar affichera toutes les routes sans badge trompeur.

