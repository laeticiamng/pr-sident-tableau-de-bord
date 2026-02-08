

## Ajout de 2 nouvelles plateformes au registre EMOTIONSCARE

### Contexte
Le registre passe de **5 a 7 plateformes**. Cela impacte 7 fichiers et necessite 2 nouvelles couleurs semantiques.

### Plateformes a ajouter

**1. Swift Care Hub** (prototype - solution urgences hopitaux)
- Key: `swift-care-hub`
- Description: Plateforme innovante dediee aux urgences hospitalieres. Triage intelligent, gestion des flux patients en temps reel, coordination des equipes soignantes et analytics de performance.
- Tagline: "Chaque seconde compte aux urgences"
- GitHub: `https://github.com/laeticiamng/swift-care-hub`
- Statut: prototype (d'apres ta reponse "1 prototype + 1 production")

**2. Track Triumph Tavern** (production)
- Key: `track-triumph-tavern`  
- Description: A definir depuis le README (stats, fonctionnalites, etc.)
- GitHub: `https://github.com/laeticiamng/track-triumph-tavern`
- Statut: production

> **NOTE IMPORTANTE** : Les repos sont prives et inaccessibles. Les descriptions, taglines, stats (commits, tables, edge functions, tests) et URLs live seront remplis avec des valeurs placeholder. **Tu devras me fournir ces informations** pour que les fiches soient exactes, ou copier-coller les READMEs dans le chat apres approbation.

---

### Fichiers impactes

| # | Fichier | Modification |
|---|---------|-------------|
| 1 | `src/lib/constants.ts` | Ajouter les 2 plateformes au tableau `MANAGED_PLATFORMS`, mettre a jour le commentaire (5 → 7) |
| 2 | `src/index.css` | Ajouter 2 couleurs CSS : `--platform-emergency` (rouge urgence) et `--platform-triumph` (orange/dore) |
| 3 | `tailwind.config.ts` | Ajouter `emergency` et `triumph` dans `platform` colors |
| 4 | `src/components/home/PlatformShowcase.tsx` | Ajouter les 2 cles dans les maps `platformIcons`, `platformGradients`, `platformAccents`, `platformBorders`, `platformBgAccents`. Mettre a jour le texte "Cinq plateformes" → "Sept plateformes". Ajuster le grid (4 → 6 cards sous le hero) |
| 5 | `src/pages/PlateformesPage.tsx` | Ajouter les 2 cles dans les maps d'icones/couleurs. Mettre a jour texte "Cinq" → "Sept", meta SEO "5 plateformes" → "7 plateformes" |
| 6 | `src/pages/HomePage.tsx` | Mettre a jour "5 Plateformes" → "7 Plateformes" |
| 7 | `src/test/components.test.tsx` | Mettre a jour le test pour passer de 5 → 7 plateformes, ajouter les 2 nouvelles cles |
| 8 | `src/pages/hq/HQPlateformesPage.tsx` | Aucune modification necessaire (dynamique via `usePlatforms()` + `MANAGED_PLATFORMS`) |

### Icones Lucide choisies
- **Swift Care Hub** : `Siren` ou `HeartPulse` (urgences medicales)
- **Track Triumph Tavern** : `Trophy` (triomphe/performance)

### Couleurs semantiques
- `--platform-emergency` : rouge urgence ~`0 85% 45%` (HSL)
- `--platform-triumph` : dore/ambre ~`32 90% 50%` (HSL)

### Section technique

Les modifications suivent le pattern existant :
1. Chaque plateforme a une entree `as const` dans `MANAGED_PLATFORMS` avec `key`, `name`, `shortDescription`, `description`, `tagline`, `github`, `liveUrl`, `color`, `stats`, `features`, `status`, `lastCommit`
2. Chaque composant UI utilise des dictionnaires `Record<string, string>` pour mapper les cles aux couleurs/icones
3. Le type `PlatformKey` est automatiquement derive du tableau, donc il s'etendra naturellement
4. Les totaux (commits, tables, tests) sont calcules dynamiquement via `reduce`

