

# Plan: Add Vascular Atlas as 10th platform

**Vascular Atlas** (`vessel-pathway-compass.lovable.app`) is an AI-powered clinical platform for vascular medicine. StudyBeats is already integrated. This plan adds Vascular Atlas and updates all "9" references to "10".

## Changes across 4 files

### 1. `src/lib/constants.ts` — Add platform entry
Add `vascular-atlas` to `MANAGED_PLATFORMS` array (position 10):
- key: `"vascular-atlas"`
- name: `"Vascular Atlas"`
- shortDescription: `"Plateforme clinique IA pour la médecine vasculaire"`
- description: Full description based on live site (AI clinical assistant, digital twin, outcomes registry, certification, simulation lab, expert network — USA, EU & Switzerland)
- tagline: `"L'excellence vasculaire, augmentée par l'IA"`
- github: `"https://github.com/laeticiamng/vessel-pathway-compass"`
- liveUrl: `"https://vessel-pathway-compass.lovable.app"`
- status: `"prototype"`
- features: AI Clinical Assistant, Vascular Digital Twin, Global Outcomes Registry, Certification & CME, Clinical Simulation Lab

### 2. `src/lib/validation.ts` — Add to platformKeySchema
Add `"vascular-atlas"` to the enum array.

### 3. `index.html` — Update all "9" → "10" + add to ItemList + noscript
- Title, meta descriptions, OG tags, Twitter tags: 9 → 10
- Organization JSON-LD description: add "médecine vasculaire"
- ItemList: numberOfItems 10, add position 10 entry (SoftwareApplication, HealthApplication)
- AboutPage description: 9 → 10
- noscript block: h1, paragraph, nav "Nos 10 plateformes", add Vascular Atlas to list

### 4. `src/lib/geo-schemas.ts` — Update all "9" → "10"
- Organization description (line 28): add "médecine vasculaire", 9→10
- FAQ answer (line 300): 9→10, add "médecine vasculaire"
- AboutPage description (line 350): 9→10
- Notre Histoire (line 380): 9→10
- Add `vascular-atlas` to `PLATFORM_GEO_META` with category HealthApplication, audience "Chirurgiens vasculaires, angiologues, médecins vasculaires"

### 5. `src/i18n/common.ts` — Footer descriptions 9 → 10
- FR: "10 plateformes SaaS innovantes"
- EN: "10 innovative SaaS platforms"
- DE: "10 innovativen SaaS-Plattformen"

## Files modified (5 files)
- `src/lib/constants.ts`
- `src/lib/validation.ts`
- `index.html`
- `src/lib/geo-schemas.ts`
- `src/i18n/common.ts`

