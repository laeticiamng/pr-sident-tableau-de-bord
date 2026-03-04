

## Plan : Ajouter la 8e plateforme "Gouvernance Agents IA"

### Contexte
L'écosystème référence actuellement 7 plateformes. Il faut ajouter une 8e plateforme avec la clé `trust-seal-chain`, l'URL `https://trust-seal-chain.lovable.app`, et des données réalistes basées sur le nom "Gouvernance Agents IA".

### Fichiers à modifier

**1. `src/lib/constants.ts`** — Ajouter l'entrée dans `MANAGED_PLATFORMS`
- Clé : `trust-seal-chain`
- Nom : Gouvernance Agents IA
- Description : Plateforme de certification et de traçabilité pour les agents IA. Registre de confiance, audit automatisé des décisions algorithmiques, scoring éthique et conformité AI Act européen.
- Tagline : "La confiance IA, certifiée et traçable"
- Stats réalistes (modules: 8, tables: 20, edgeFunctions: 12, branches: 3, commits: 450, tests: 85)
- Features : Trust Seal certification, Audit trail IA, Scoring éthique, Conformité AI Act, Registre agents
- Statut : prototype
- Mettre à jour le commentaire "7 → 8 plateformes"

**2. `src/lib/platformConfig.ts`** — Ajouter la clé `trust-seal-chain` dans les 5 registres
- Icône : `ShieldCheck` (lucide-react)
- Couleur : nouvelle variable `platform-governance` (bleu-violet pour la confiance/gouvernance)

**3. `tailwind.config.ts`** — Ajouter `governance: "hsl(var(--platform-governance))"` dans `platform`

**4. `src/index.css`** — Ajouter la variable CSS `--platform-governance` (teinte bleu-violet ~250)

**5. Traductions i18n** — Mettre à jour les mentions "7 → 8" dans :
- `src/i18n/common.ts` : footer description
- `src/i18n/home.ts` : "Sept → Huit plateformes" / "Seven → Eight platforms"
- `src/i18n/platforms.ts` : subtitle, governance section ("Sept → Huit excellences")
- `src/i18n/vision.ts` : "7 platforms · 1 mission" → "8 platforms · 1 mission"

**6. `src/pages/PlateformesPage.tsx`** — Changer les valeurs hardcodées `"7"` en calcul dynamique (`allPlatforms.length`)

**7. `src/pages/VisionPage.tsx`** — Changer la valeur hardcodée `7` en `MANAGED_PLATFORMS.length`

**8. Pages HQ** — Mettre à jour `totalPlatforms` fallback de `7` à `8` dans :
- `src/pages/hq/BriefingRoom.tsx`
- `src/components/hq/cockpit/KeyMetricsGrid.tsx`

**9. Documentation** — Mettre à jour `docs/PLATFORM_AUDIT_AND_PLAN.md` avec la 8e plateforme

### Résultat
La plateforme apparaîtra automatiquement sur `/plateformes`, dans le cockpit HQ, le briefing room et toutes les vues qui itèrent sur `MANAGED_PLATFORMS`.

