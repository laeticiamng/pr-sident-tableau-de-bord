

# Renommage de "Pixel Perfect Replica" en "NEARVITY"

## Contexte
Renommage definitif de la plateforme sociale. Le nouveau nom **NEARVITY** (near + activity) remplace "Pixel Perfect Replica" partout dans le code. La key interne passe de `pixel-perfect-replica` a `nearvity`.

## Fichiers impactes (8 fichiers)

| # | Fichier | Modifications |
|---|---------|--------------|
| 1 | `src/lib/constants.ts` | key: `nearvity`, name: `NEARVITY`, github URL, tagline adapte |
| 2 | `src/lib/validation.ts` | Schema enum: `pixel-perfect-replica` → `nearvity` |
| 3 | `src/hooks/useGitHubSync.ts` | key + repo: `nearvity` |
| 4 | `src/components/home/PlatformShowcase.tsx` | Toutes les maps (icons, gradients, accents, borders, bgAccents): remplacer la cle |
| 5 | `src/pages/PlateformesPage.tsx` | Toutes les maps + meta SEO: remplacer nom et cle |
| 6 | `src/pages/VisionPage.tsx` | Timeline 2025: "Pixel Perfect Replica" → "NEARVITY" |
| 7 | `src/components/hq/RunTemplateDialog.tsx` | Option value + label |
| 8 | `src/test/components.test.tsx` | 2 tableaux de cles: `pixel-perfect-replica` → `nearvity` |
| 9 | `src/test/components/ExecutiveCockpit.test.tsx` | key dans mock data |

## Details des changements

### `src/lib/constants.ts`
- `key`: `"pixel-perfect-replica"` → `"nearvity"`
- `name`: `"Pixel Perfect Replica"` → `"NEARVITY"`
- `github`: `".../pixel-perfect-replica"` → `".../nearvity"` (ou conserver l'ancien si le repo GitHub n'est pas renomme)
- Le reste (description, tagline, stats, features) reste inchange

### Tous les composants UI
Remplacement mecanique de la cle `"pixel-perfect-replica"` par `"nearvity"` dans tous les dictionnaires Record.

### SEO / meta
`PlateformesPage.tsx` meta description: "Pixel Perfect Replica" → "NEARVITY"

### Timeline Vision
"EmotionsCare, Pixel Perfect Replica, System Compass..." → "EmotionsCare, NEARVITY, System Compass..."

## Risque
Faible — renommage textuel + cle. Le type `PlatformKey` se derive automatiquement du tableau `MANAGED_PLATFORMS`.

