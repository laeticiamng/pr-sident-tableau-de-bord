

## Audit des 6 tickets proposés vs. l'état réel du code

Après inspection complète du code source, voici l'analyse ticket par ticket avec le vrai statut et les actions nécessaires.

---

### Ticket 1 — [P0] Fix crash HomePage (bgColor fallback)
**Statut : NON REPRODUCTIBLE — Le crash n'existe pas.**

- `HomePage.tsx` n'utilise jamais `bgColor`. Il utilise `getPlatformConfig(key)` qui retourne toujours un `DEFAULT_CONFIG` safe (ligne 155 de `platformConfig.ts`).
- `bgColor` n'existe que dans `cos-types.ts` (COS phases) et `OKRProgress.tsx`, où les valeurs sont toujours définies statiquement.
- **Action : AUCUNE.** Ticket à fermer ou à reclasser si un crash réel est observé avec stack trace.

### Ticket 2 — [P0] Sync MANAGED_PLATFORMS ↔ platformKeySchema
**Statut : DÉJÀ SYNCHRONISÉ.**

- `platformKeySchema` dans `validation.ts` (ligne 142) est dérivé dynamiquement :
  ```ts
  const PLATFORM_KEYS = MANAGED_PLATFORMS.map((p) => p.key) as unknown as readonly [string, ...string[]];
  export const platformKeySchema = z.enum(PLATFORM_KEYS, ...);
  ```
- Les 10 clés (`emotionscare`, `nearvity`, `system-compass`, `growth-copilot`, `med-mng`, `swift-care-hub`, `track-triumph-tavern`, `trust-seal-chain`, `studybeats`, `vascular-atlas`) sont identiques dans `constants.ts`, `platformConfig.ts` et `i18n/platforms.ts`.
- Un test existant (`platform-config-sync.test.ts`) vérifie déjà cette synchronisation.
- **Action : AUCUNE.** Déjà couvert par code + tests.

### Ticket 3 — [P1] Tests régression fallback bgColor
**Statut : NON PERTINENT** (le crash P0 n'existe pas).

- Le test `platform-config-sync.test.ts` couvre déjà le fallback `getPlatformConfig("unknown")` → default config.
- **Action : AUCUNE.** Test existant suffisant.

### Ticket 4 — [P1] Validation runtime données plateformes (Zod/guard)
**Statut : PARTIELLEMENT COUVERT, amélioration possible.**

- `platformKeySchema` valide les clés. `getPlatformConfig()` a un fallback safe.
- **Ce qui manque** : pas de validation Zod du shape complet d'une plateforme (stats, features, urls). Si un champ `stats.commits` est `undefined` après une mauvaise mise à jour de `constants.ts`, le code crasherait silencieusement (ex: `HomePage.tsx` ligne 177 fait `.reduce()` sur `stats.commits`).
- **Action recommandée** :
  1. Créer un `managedPlatformSchema` Zod dans `validation.ts` validant le shape complet (key, name, stats, features, liveUrl, etc.)
  2. Ajouter un test qui parse `MANAGED_PLATFORMS` contre ce schema
  3. Pas de validation runtime en production (coût inutile) — validation au build/test uniquement

### Ticket 5 — [P1] Mise à jour docs/contrat API clés plateformes
**Statut : PERTINENT.**

- `docs/DATABASE_SCHEMA.md` et `docs/MODULES_GUIDE.md` existent mais les clés plateformes ne sont pas documentées comme contrat API.
- **Action recommandée** :
  1. Ajouter une section "Platform Registry Contract" dans `docs/API_REFERENCE.md` listant les 10 clés, leurs types et les fichiers source de vérité
  2. ~30 min de travail

### Ticket 6 — [P1] Audit i18n plateformes (FR/EN/DE)
**Statut : DÉJÀ COMPLET.**

- `i18n/platforms.ts` contient les 10 plateformes × 3 langues (FR/EN/DE) avec tagline, description et features.
- `i18n/home.ts` features items sont vérifiés par le test existant (`homeTranslations.fr/en/de.features.items.length === MANAGED_PLATFORMS.length`).
- **Action : AUCUNE.** Couverture complète vérifiée.

---

## Plan d'implémentation (tickets réellement utiles)

Seuls 2 tickets sur 6 nécessitent du travail :

### 1. Validation Zod du shape plateforme (ex-Ticket 4) — ~1h
- Fichier : `src/lib/validation.ts`
  - Ajouter `managedPlatformSchema` validant : `key`, `name`, `shortDescription`, `description`, `tagline`, `github` (url), `liveUrl` (url), `color`, `stats` (object with modules/tables/edgeFunctions/branches/commits/tests as numbers), `features` (string[]), `status` (enum), `lastCommit` (date string)
- Fichier : `src/test/platform-config-sync.test.ts`
  - Ajouter un test `MANAGED_PLATFORMS passes full Zod schema validation` qui parse chaque entrée

### 2. Documentation contrat API (ex-Ticket 5) — ~30min
- Fichier : `docs/API_REFERENCE.md`
  - Ajouter section "Platform Registry" documentant les clés, le shape attendu, et les fichiers source de vérité (`constants.ts`, `platformConfig.ts`, `i18n/platforms.ts`)

