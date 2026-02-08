

# Audit C-Suite complet et corrections pre-publication

## Synthese de l'audit multi-persona

### Directeur Marketing (CRITIQUE)

**Probleme 1 — Jargon technique sur les pages publiques**
Les descriptions de fonctionnalites sur la HomePage (section "Fonctionnalites du Siege Numerique") contiennent du jargon interne interdit en vitrine :
- "7 types de runs : brief executif, standup CEO" — terme "runs" incomprehensible
- "Owner Approval Gate obligatoire" — terme technique interne
- "Intelligence concurrentielle via Perplexity AI" — cite un fournisseur externe
- "Workflow de validation" — anglicisme technique
- "GitHub reelles" / "commits GitHub synchronises" — termes dev

**Probleme 2 — Labels techniques dans la grille de stats PlateformesPage**
Les labels "Tables DB", "Commits", "Branches", "Fonctions" dans les grilles de stats de `/plateformes` sont du jargon technique pur. Un visiteur non-technique ne comprend pas "Tables DB" ou "Branches". Il faut les renommer en termes business.

**Probleme 3 — Stats de la HomePage vs PlateformesPage**
La HomePage affiche "1 400+" tests mais la PlateformesPage calcule dynamiquement le total (actuellement 1 455). Coherence correcte.

**Probleme 4 — Features pills contiennent du jargon**
Les `features` dans `constants.ts` contiennent : "Streaming SSE", "Mode recherche Perplexity", "PWA offline", "RBAC", "Approval Gate" — visibles sur `/plateformes`.

### CEO — Audit strategique
- Structure de navigation OK (/, /plateformes, /vision, /contact + legal)
- CTA clair vers `/plateformes` depuis la homepage
- Timeline Vision coherente avec l'historique reel
- Pas de page "A propos" separee mais `/vision` remplit ce role

### CISO — Audit securite
- Auth page : login-only (pas de signup expose) — correct
- ProtectedRoute sur toutes les routes /hq — correct
- Pas de secrets cote client visibles
- Edge functions securisees avec JWT/RBAC

### DPO — Audit RGPD
- Pages legales presentes : mentions, confidentialite, CGV, registre RGPD
- Formulaire contact avec validation Zod + sanitisation
- Lien confidentialite visible dans le footer

### Head of Design — Audit UX
- Hierarchie visuelle excellente avec les gradients Hero
- Mobile responsive avec tailles granulaires
- Contraste Hero bg-hero-gradient + text-white : conforme
- Scroll animations implementees sur la HomePage

### Beta testeur — Points critiques restants
- Les features pills techniques sur `/plateformes` cassent l'immersion premium
- Le terme "Modules" dans la grille de stats est ambigu a cote de "Fonctions"

---

## Plan de corrections (3 fichiers)

### 1. `src/pages/HomePage.tsx` — Rewrite des descriptions features

Remplacer les 4 descriptions de la section "Fonctionnalites du Siege Numerique" pour eliminer tout jargon :

| Feature | Avant | Apres |
|---------|-------|-------|
| Intelligence IA | "...7 types de runs : brief executif, standup CEO..." | "Rapports strategiques generes automatiquement chaque jour. Briefings de direction, audits de securite, veille concurrentielle — tout est synthetise pour vous." |
| Supervision en temps reel | "...commits GitHub synchronises..." | "Visualisez l'etat de sante de toutes vos plateformes en un coup d'oeil. Disponibilite, mises a jour et alertes centralises." |
| Validation des actions | "...Owner Approval Gate obligatoire..." | "Chaque action critique passe par une validation presidentialle. Deployements, modifications sensibles : rien ne se fait sans votre accord." |
| Veille strategique | "...via Perplexity AI..." | "Recherche automatisee sur les tendances de votre marche. Analyse concurrentielle et opportunites identifiees en temps reel." |

### 2. `src/lib/constants.ts` — Nettoyage des features pills

Remplacer les termes techniques dans les tableaux `features` de chaque plateforme :

| Plateforme | Avant | Apres |
|-----------|-------|-------|
| Med MNG | "Streaming SSE" | "Ecoute en continu" |
| Med MNG | "Mode recherche Perplexity" | "Recherche medicale IA" |
| Med MNG | "PWA offline" | "Disponible hors connexion" |
| Growth Copilot | "Approval Gate" | "Validation presidentialle" |
| Growth Copilot | "Voice Commands" | "Commandes vocales" |

### 3. `src/pages/PlateformesPage.tsx` — Labels stats business-friendly

Renommer les labels techniques de la grille de stats individuelles et du hero :

| Avant | Apres |
|-------|-------|
| "Tables DB" | "Structures" |
| "Commits" | "Evolutions" |
| "Branches" | "Versions" |
| "Fonctions" (hero + gouvernance) | "Modules" |
| "Modules" (hero + gouvernance) | "Modules" (pas de doublon — fusionner "Fonctions" en "Modules") |

Dans le hero de `/plateformes`, la grille affiche "Modules" ET "Fonctions" ce qui est redondant. Remplacer :
- "Tables DB" → "Structures"
- "Modules" (label actuel pour `totals.functions`) → "Integrations"

Et dans les cartes individuelles :
- "Tables DB" → "Structures"
- "Commits" → "Evolutions"
- "Branches" → "Versions"
- "Fonctions" → "Integrations"

### Fichiers non modifies (passes avec succes)

- Auth page : login-only, zero signup expose
- Pages legales : completes et conformes
- NotFound : fonctionnel avec CTA de retour
- PublicHeader/Footer : navigation coherente, liens legaux presents
- VisionPage : timeline coherente, pas de jargon
- ContactPage : formulaire valide avec Zod, sanitisation, rate-limiting edge function

### Risque
Faible — modifications textuelles uniquement (descriptions, labels). Aucun changement de structure, logique ou style.

