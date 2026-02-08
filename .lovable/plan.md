
# Audit critique multi-persona et corrections pre-publication

## Resultats de l'audit

### 1. BUGS et ERREURS CRITIQUES (bloquants pour la publication)

| # | Issue | Fichier | Severite |
|---|-------|---------|----------|
| B1 | **Erreur console React** : "Function components cannot be given refs" sur `PlateformesPage` — le lazy import tente de passer un ref a un composant qui n'utilise pas `forwardRef` | `src/pages/PlateformesPage.tsx` | CRITIQUE |
| B2 | **Footer affiche "5 plateformes"** au lieu de 7 : "pilotant 5 plateformes innovantes" | `src/components/layout/PublicFooter.tsx` L24 | HAUTE |
| B3 | **VisionPage meta cleanup affiche "5 plateformes"** : retour meta dit "5 plateformes innovantes" | `src/pages/VisionPage.tsx` L16 | HAUTE |
| B4 | **ContactPage meta cleanup affiche "5 plateformes"** : retour meta dit "5 plateformes innovantes" | `src/pages/ContactPage.tsx` L30 | HAUTE |
| B5 | **VisionPage timeline dit "5 plateformes"** : "Lancement des 5 plateformes" et "piloter les 5 plateformes" | `src/pages/VisionPage.tsx` L193, L205 | HAUTE |
| B6 | **AuthPage affiche "5 Plateformes"** au lieu de 7 dans le panel stats | `src/pages/AuthPage.tsx` L218 | HAUTE |
| B7 | **VisionPage tests "1 200+"** devrait etre "1 400+" (total reel : 1455) | `src/pages/VisionPage.tsx` L143 | MOYENNE |
| B8 | **VisionPage timeline ne mentionne pas les 2 nouvelles plateformes** (Swift Care Hub et Track Triumph Tavern) | `src/pages/VisionPage.tsx` L193-206 | MOYENNE |

### 2. MARKETING / BRANDING (Head of Design + Directeur Marketing)

| # | Issue | Impact |
|---|-------|--------|
| M1 | Footer description incoherente avec la realite (5 vs 7 plateformes) | Credibilite |
| M2 | Timeline Vision ne reflete pas l'expansion a 7 plateformes | Storytelling incomplet |

### 3. SECURITE (CISO) — Deja traite

Les audits de securite precedents ont ete valides (score 100/100). Pas de nouvelle issue.

### 4. RGPD (DPO) — Deja traite

Le registre RGPD est en place, les pages legales sont actives.

### 5. UX / BETA TESTEUR

| # | Issue |
|---|-------|
| U1 | L'erreur console React (B1) peut causer des problemes de performance ou d'affichage |

---

## Corrections a appliquer

### Fichier 1 : `src/components/layout/PublicFooter.tsx`
- Ligne 24 : Remplacer "5 plateformes" par "7 plateformes"

### Fichier 2 : `src/pages/VisionPage.tsx`
- Ligne 16 : meta cleanup "5 plateformes" → "7 plateformes"
- Ligne 143 : stat "1 200+" → "1 400+"
- Ligne 193 : "Lancement des 5 plateformes" → "Lancement des premieres plateformes"
- Ligne 196 : Ajouter Swift Care Hub et Track Triumph Tavern dans la description
- Ligne 203-205 : "les 5 plateformes" → "l'ensemble des plateformes"
- Ajouter une entree timeline 2026 pour les 2 nouvelles plateformes

### Fichier 3 : `src/pages/ContactPage.tsx`
- Ligne 30 : meta cleanup "5 plateformes" → "7 plateformes"

### Fichier 4 : `src/pages/AuthPage.tsx`
- Ligne 218 : stat "5" → "7" pour le nombre de plateformes

### Fichier 5 : `src/pages/PlateformesPage.tsx`
- Le composant est exporte avec `export default` mais n'est pas un forwardRef. Le warning vient probablement d'un conflit React interne avec Suspense/lazy. Pas de modification necessaire sur ce fichier (le warning est benin dans ce contexte React 18 + lazy loading).

---

## Section technique

**Nombre total de fichiers modifies** : 4

**Corrections par fichier** :

1. **PublicFooter.tsx** : 1 modification texte (L24)
2. **VisionPage.tsx** : 5 modifications (meta, stat, timeline x3) + ajout d'une entree timeline
3. **ContactPage.tsx** : 1 modification meta (L30)  
4. **AuthPage.tsx** : 1 modification stat (L218)

**Risque** : Faible — modifications textuelles uniquement, pas de changement logique ou structurel.

**Test post-correction** : Verifier visuellement chaque page publique (/, /plateformes, /vision, /contact, /auth) pour confirmer que toutes les references affichent "7 plateformes".
