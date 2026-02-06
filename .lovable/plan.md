

## Audit Visuel & Branding Premium - Corrections Prioritaires

Apres inspection complete de toutes les pages publiques (Accueil, Plateformes, Vision, Contact, Auth) en desktop et mobile, voici les corrections classees par priorite.

---

### PRIORITE 1 — Bugs critiques (visibilite cassee)

**1. Hero de /plateformes invisible en mode sombre**
La section Hero de la page Plateformes utilise encore `bg-gradient-to-br from-primary via-primary` au lieu de `bg-hero-gradient`. En dark mode, `--primary` devient blanc, rendant le fond blanc avec du texte blanc = invisible. C'est le meme bug qui a ete corrige sur HomePage mais pas applique ici.

- Fichier : `src/pages/PlateformesPage.tsx` ligne 122
- Correction : remplacer `bg-gradient-to-br from-primary via-primary to-primary/90` par `bg-hero-gradient`

---

### PRIORITE 2 — Clarte du message en 3 secondes

**2. Sous-titre Hero trop generique**
"Siege Social Numerique" ne dit rien a un visiteur exterieur. En 3 secondes, il ne comprend pas ce qu'EMOTIONSCARE fait. Le sous-titre actuel est un terme interne, pas une proposition de valeur.

- Correction : remplacer "Siege Social Numerique" par une ligne plus descriptive comme : **"Editeur de logiciels SaaS — Sante, Education, International"**
- Le badge au-dessus garde "Siege Social Numerique" pour le contexte institutionnel

**3. Description Hero trop vague**
"5 plateformes SaaS depuis un centre de commandement unique, propulse par l'IA" — le mot "commandement" est jargonnant. Un visiteur ne sait toujours pas ce que font ces plateformes.

- Correction : remplacer par quelque chose comme **"5 plateformes innovantes pour la sante, l'education medicale, la relocalisation, la croissance et le social"**

---

### PRIORITE 3 — Hierarchie visuelle et conversion

**4. Section Features : titres en anglais**
"Executive AI Runs", "Monitoring 5 plateformes" — melange anglais/francais incoherent. Pour un site francais cible stakeholders francophones, tout doit etre en francais.

- Correction : renommer en "Intelligence IA", "Supervision en temps reel", "Validation des actions", "Veille strategique"

**5. Section Stats : "Edge Functions" incomprehensible**
Un visiteur non-technique ne sait pas ce qu'est une "Edge Function". La stat "349 Edge Functions" n'a aucun impact emotionnel.

- Correction : remplacer par une metrique comprehensible : "16K+ Lignes de code" ou "875 Tables de donnees" ou "1 300+ Tests"

**6. CTA final peu engageant**
"Acces HQ" ne communique aucune valeur. Le texte "Centre de Gouvernance" est interne.

- Correction du titre : "Decouvrez nos solutions" ou "Explorez l'ecosysteme"
- CTA : "Voir les plateformes en detail" au lieu de "Acces HQ" (qui est reserve aux admins)

---

### PRIORITE 4 — Coherence de l'identite

**7. Mention "SASU" dans le header**
Le suffixe legal "SASU" apparait sous le logo dans le header — c'est du bruit visuel. Comme dit dans les conventions du projet, le branding public doit etre epure sans suffixe legal.

- Correction : retirer "SASU" du header, le garder uniquement dans le footer

**8. Page Contact : hero sans fond immersif**
La page Contact utilise `bg-subtle-gradient` (fond blanc leger) contrairement aux autres pages qui ont un hero navy immersif. Cela casse la coherence visuelle du parcours.

- Correction : utiliser `bg-hero-gradient text-white` pour le hero Contact, comme Vision et Plateformes

---

### PRIORITE 5 — Ameliorations UX/Mobile

**9. Bouton "Espace President" visible publiquement**
Le bouton "Espace President" dans le header est destine a l'admin unique. Pour un visiteur lambda, c'est confus. Il devrait etre discret.

- Correction : renommer en "Connexion" (standard) ou le deplacer dans le footer

**10. Page Vision : section "Engagements" stat floue**
La stat "Haute" pour Performance est vague et non-premium. Toutes les autres stats sont precises ("100%", "WCAG AA", "1 200+").

- Correction : remplacer par "99.9%" avec description "Disponibilite visee"

---

### Resume technique des modifications

| Fichier | Modification |
|---|---|
| `src/pages/PlateformesPage.tsx` l.122 | `bg-hero-gradient` au lieu de `from-primary via-primary` |
| `src/pages/HomePage.tsx` | Sous-titre Hero + description + labels features FR + stat Edge Functions + CTA final |
| `src/components/layout/PublicHeader.tsx` | Retirer "SASU" sous le logo |
| `src/pages/ContactPage.tsx` | Hero `bg-hero-gradient text-white` |
| `src/pages/VisionPage.tsx` l.148-149 | Stat "99.9%" au lieu de "Haute" |

Total : 5 fichiers, ~15 modifications ponctuelles, zero risque de regression.

