

# Plan: Add StudyBeats everywhere + update all "8" → "9" references

StudyBeats was added to `MANAGED_PLATFORMS` but multiple hardcoded "8" references remain across the codebase. Additionally, `platformKeySchema` in validation.ts doesn't include `studybeats`. The testing of auth/reset-password language switching will be done via browser tools after implementation.

## Changes

### 1. Add `studybeats` to `platformKeySchema` (src/lib/validation.ts)
- Add `"studybeats"` to the enum array at line 170-179

### 2. Update `index.html` — all "8" → "9" references
- **Line 11**: title `8 logiciels` → `9 logiciels`
- **Line 12**: meta description `8 plateformes` → `9 plateformes`
- **Line 18**: og:title `8 logiciels` → `9 logiciels`
- **Line 19**: og:description `8 plateformes` → `9 plateformes`
- **Line 30**: og:image:alt `8 plateformes` → `9 plateformes`
- **Line 36**: twitter:description `8 plateformes` → `9 plateformes`
- **Line 38**: twitter:image:alt `8 plateformes` → `9 plateformes`
- **Line 49**: Organization description `8 logiciels` → `9 logiciels`, add "mémorisation musicale" to the list
- **Line 78**: knowsAbout — add `"Mémorisation par la musique"`
- **Line 114**: FAQ answer — `8 plateformes` → `9 plateformes`, add "mémorisation musicale"
- **Lines 153-251**: ItemList — update description to "9", numberOfItems to 9, add StudyBeats as position 9
- **Line 261**: AboutPage description `8 plateformes` → `9 plateformes`
- **Line 291**: Notre Histoire `8 plateformes` → `9 plateformes`
- **Lines 397-420**: noscript block — update h1 `8 logiciels` → `9 logiciels`, paragraph, nav link "Nos 9 plateformes", add StudyBeats to the list

### 3. Update `src/lib/geo-schemas.ts` — all "8" → "9"
- Line 28: Organization description
- Line 285: FAQ answer  
- Line 334: AboutPage description
- Line 364: Notre Histoire description

### 4. Test auth language switching via browser
- Navigate to /auth, switch languages, submit empty form to verify validation messages change
- Navigate to /reset-password, verify LanguageSwitcher is present

### 5. Verify /plateformes shows StudyBeats via browser

## Files modified (3 files)
- `src/lib/validation.ts` (add studybeats to enum)
- `index.html` (8→9 everywhere + add StudyBeats to ItemList + noscript)
- `src/lib/geo-schemas.ts` (8→9 in descriptions)

