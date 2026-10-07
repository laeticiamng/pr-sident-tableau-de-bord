# Tests Playwright (Horizon 2)

Tests E2E couvrant les parcours critiques EmotionsCare HQ.

## Lancement local

```bash
# 1. S'assurer que `npm run dev` tourne sur :8080 (Playwright le démarre sinon)
# 2. Installer les navigateurs (1 fois) :
npx playwright install chromium webkit

# 3. Lancer la suite complète :
npx playwright test

# Ou un seul fichier :
npx playwright test e2e/public-home.spec.ts
```

## Variables d'env

- `PLAYWRIGHT_BASE_URL` — URL ciblée (défaut `http://localhost:8080`)
- `PLAYWRIGHT_HQ_EMAIL` — email Owner pour parcours HQ (sinon tests HQ skip)
- `PLAYWRIGHT_HQ_PASSWORD` — mot de passe Owner

## Couverture

### Public — exécutés en CI sur chaque push / PR (`.github/workflows/e2e.yml`, build hermétique)
1. `public-home` — Accueil MNG : titre, quatre produits et liens, lien Contact, aucune erreur console
2. `public-redirects` — Les anciennes pages (/tarifs, /status, /trust, /vision, /plateformes, /studio) redirigent vers l'accueil
3. `public-contact` — Formulaire contact
4. `public-i18n-translations` — Page Contact en FR / EN / DE + `<html lang>` + aria-label
5. `public-verified-badge` — Slot canonique du badge MedReg (page Contact × 5 viewports)
6. `public-verified-badge-a11y` — Rôles, aria-label, aria-describedby, aria-busy et région `role="status"` du badge

### Production — déclenchement manuel (`.github/workflows/e2e-production.yml`)
7. `hq-auth-login`, `hq-briefing-room`, `hq-cockpit`, `hq-finance`, `hq-diagnostics`, `hq-securite` — compte Owner réel (sinon skip)
8. `infra-healthz` — `/functions/v1/healthz` du projet Supabase de production
9. `published-supabase-boot` — démarrage de l'URL publiée

### Visuel — tag `@visuel`, exclu de la CI tant qu'aucune baseline n'est commitée
10. `public-visual-snapshots` — Diff visuel fullpage Accueil / Contact aux largeurs 320 / 768 / 1280 / 1920 px.
    Les baselines doivent être générées sur le runner Linux de la CI : lancer `e2e.yml` à la main
    avec `mise_a_jour_baselines`, puis commiter l'artefact `baselines-visuelles`
    dans `e2e/public-visual-snapshots.spec.ts-snapshots/`.

> Première exécution : générer les baselines avec
> `npx playwright test public-visual-snapshots --update-snapshots`.
