

# Correction URL NEARVITY — 2 fichiers

## Problemes detectes

| Fichier | Probleme | Correction |
|---------|----------|------------|
| `src/lib/constants.ts` | `liveUrl` = `https://nearvity.lovable.app` | Remplacer par `https://pixel-perfect-clone-6574.lovable.app` |
| `supabase/functions/platform-analysis/index.ts` | Cle `pixel-perfect-replica`, nom `Pixel Perfect Replica`, repo `pixel-perfect-replica` | Mettre a jour : cle `nearvity`, nom `NEARVITY`, repo `nearvity`, URL deja correcte |

## Detail des modifications

### 1. `src/lib/constants.ts` (ligne 25)
- Remplacer `"https://nearvity.lovable.app"` par `"https://pixel-perfect-clone-6574.lovable.app"`

### 2. `supabase/functions/platform-analysis/index.ts` (lignes 16-21)
- `key`: `"pixel-perfect-replica"` → `"nearvity"`
- `repo`: `"laeticiamng/pixel-perfect-replica"` → `"laeticiamng/nearvity"`
- `name`: `"Pixel Perfect Replica"` → `"NEARVITY"`
- `liveUrl` : deja correct (`https://pixel-perfect-clone-6574.lovable.app`)

De plus, cette edge function ne liste que 5 plateformes au lieu des 7 actuelles (UrgenceOS et Track Triumph manquent). Cela pourra etre corrige dans un prochain passage.

## Risque
Tres faible — corrections de chaines de caracteres uniquement.

