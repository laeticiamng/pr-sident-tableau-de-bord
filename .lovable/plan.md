
# Correction : Texte invisible sur la page Vision en mode sombre

## Probleme

Le hero de la page `/vision` utilise `text-primary-foreground` sur un fond sombre (`bg-hero-gradient`). En mode sombre, `--primary-foreground` vaut `222 47% 11%` (bleu marine fonce) -- du texte fonce sur fond fonce = invisible.

Le meme probleme affecte potentiellement la section mobile du hero sur `/auth`.

## Cause racine

Le gradient hero est **toujours sombre** (bleu marine), quel que soit le theme. Mais `text-primary-foreground` change selon le theme :
- Mode clair : blanc (visible)
- Mode sombre : bleu marine (invisible)

## Correction

Remplacer `text-primary-foreground` par `text-white` dans les sections hero qui utilisent `bg-hero-gradient`, car le fond est toujours sombre independamment du theme.

### Fichiers modifies

**`src/pages/VisionPage.tsx`** (3 occurrences) :
- Ligne 23 : section hero `text-primary-foreground` -> `text-white`
- Ligne 29 : h1 `text-primary-foreground` -> `text-white`
- Ligne 33 : paragraphe `text-primary-foreground` -> `text-white/90` (legerement transparent pour hierarchie visuelle)

**`src/pages/AuthPage.tsx`** : Verifier et corriger les memes classes dans la section mobile hero (ligne 73+) si le probleme existe aussi.

### Section technique

```text
VisionPage.tsx :
  L23 : "bg-hero-gradient text-primary-foreground" -> "bg-hero-gradient text-white"
  L29 : "text-primary-foreground" -> "text-white"
  L33 : "text-primary-foreground" -> "text-white/90"

AuthPage.tsx :
  Verifier les classes text-* dans le bloc lg:hidden bg-hero-gradient
```

### Risque
Nul. Remplacement de classes CSS uniquement. Le blanc est lisible sur le gradient sombre dans les deux themes.
