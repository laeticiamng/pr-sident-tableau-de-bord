

## Audit Visuel & Branding Premium — Corrections Post-V1

Apres inspection des 5 pages publiques en desktop (1920px) et relecture complete du code, les corrections majeures du plan precedent ont ete appliquees. Voici les problemes restants, classes par priorite.

---

### PRIORITE 1 — Incoherences residuelles de la V1

**1. Page /plateformes : "Edge Functions" toujours present dans 2 endroits**
Le hero de PlateformesPage affiche toujours "Edge Functions" dans les stats du hero (ligne 153) et dans la section gouvernance finale (ligne 389). Ce terme technique reste incomprehensible pour un visiteur non-technique.

- Fichier : `src/pages/PlateformesPage.tsx` lignes 153 et 389
- Correction : remplacer par "Modules" ou "Fonctions" dans les deux endroits

**2. Page /plateformes : CTA final "Acceder au HQ" non corrige**
Le bouton CTA de la section Gouvernance (ligne 410) dit encore "Acceder au HQ" au lieu d'un CTA oriente visiteur.

- Fichier : `src/pages/PlateformesPage.tsx` ligne 410
- Correction : remplacer par "Decouvrir nos solutions" et pointer vers `/contact` ou garder `/auth` mais avec un label moins interne

**3. Page /plateformes : stat labels "Edge Fns" dans les cartes plateformes**
Chaque carte plateforme montre "Edge Fns" (ligne 317) — meme probleme de jargon technique.

- Fichier : `src/pages/PlateformesPage.tsx` ligne 317
- Correction : remplacer "Edge Fns" par "Fonctions" ou "API"

**4. Page /auth : "SASU" tres visible**
La page Auth affiche "SASU" en gros sur le panneau droit desktop (ligne 213, avec tracking large et lignes decoratives) et sur le header mobile (ligne 88). Selon les conventions du projet, le suffixe legal ne doit pas etre mis en avant visuellement.

- Fichier : `src/pages/AuthPage.tsx` lignes 87-89 et 211-214
- Correction : retirer les lignes "SASU" des deux emplacements, ou les remplacer par "Editeur de logiciels" comme dans le header

**5. Page /auth : titre "Espace President" encore present**
Le titre de la page Auth (lignes 107 et 115) dit "Espace President" — un terme interne qui n'est pas standard et qui devrait etre "Connexion" ou "Espace client" pour rester coherent avec le bouton du header.

- Fichier : `src/pages/AuthPage.tsx` lignes 107 et 115
- Correction : remplacer "Espace President" par "Connexion" dans les deux emplacements

---

### PRIORITE 2 — Coherence du parcours visiteur

**6. Page /auth : description "cockpit executif" et "precision chirurgicale"**
Le texte du panneau droit (ligne 218) parle de "cockpit executif" et "precision chirurgicale" — jargon interne incomprehensible pour un visiteur externe.

- Fichier : `src/pages/AuthPage.tsx` ligne 217-218
- Correction : remplacer par "Accedez a votre espace de gestion pour piloter vos plateformes et suivre vos indicateurs."

**7. Page /auth : stat "Ambition : infini" non-credible**
La stat "infini" pour "Ambition" (ligne 233) est floue et non-premium. Les deux autres stats sont precises ("5 Plateformes", "39 Agents IA").

- Fichier : `src/pages/AuthPage.tsx` ligne 232-233
- Correction : remplacer par une stat concrete comme "24/7" avec label "Monitoring" ou "100%" avec "Made in France"

**8. Page /plateformes : donnees meta SEO mentionnent "Edge Functions"**
La meta description (ligne 83) inclut "349 Edge Functions" — a aligner avec le changement de stat.

- Fichier : `src/pages/PlateformesPage.tsx` ligne 83
- Correction : remplacer "349 Edge Functions" par "1 300+ tests"

---

### PRIORITE 3 — Ameliorations de finesse

**9. Footer : sous-titre "SASU" sans contexte**
Le footer affiche "SASU" sous le logo (ligne 20) sans description. Le header utilise maintenant "Editeur de logiciels". Le footer devrait etre coherent mais peut garder la mention legale complete.

- Fichier : `src/components/layout/PublicFooter.tsx` ligne 20
- Correction : remplacer par "Editeur de logiciels" pour coherence avec le header, la mention SASU etant deja dans le copyright en bas

**10. Meta titles utilisent "SASU" partout**
Toutes les pages (PlateformesPage l.80, VisionPage l.8, ContactPage l.22, HomePage l.69) utilisent "EMOTIONSCARE SASU" dans les titres SEO. Pour la coherence de marque publique, le titre devrait etre "EMOTIONSCARE" sans SASU.

- Correction : retirer "SASU" des document.title de toutes les pages publiques

---

### Resume technique

| # | Fichier | Modification |
|---|---|---|
| 1 | `PlateformesPage.tsx` l.153, l.389 | "Edge Functions" → "Modules" |
| 2 | `PlateformesPage.tsx` l.410 | CTA "Acceder au HQ" → "Nous contacter" |
| 3 | `PlateformesPage.tsx` l.317 | "Edge Fns" → "Fonctions" |
| 4 | `AuthPage.tsx` l.87-89, l.211-214 | Retirer "SASU" visible |
| 5 | `AuthPage.tsx` l.107, l.115 | "Espace President" → "Connexion" |
| 6 | `AuthPage.tsx` l.217-218 | Description accessible |
| 7 | `AuthPage.tsx` l.232-233 | Stat "infini" → stat concrete |
| 8 | `PlateformesPage.tsx` l.83 | Meta description sans "Edge Functions" |
| 9 | `PublicFooter.tsx` l.20 | "SASU" → "Editeur de logiciels" |
| 10 | 4 fichiers | Retirer "SASU" des document.title |

Total : 4 fichiers, ~20 modifications ponctuelles, zero risque de regression.

