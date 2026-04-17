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

## Couverture (12 parcours)

### Public (5)
1. `public-home` — Page d'accueil charge + CTA visible
2. `public-pricing` — Page Tarifs
3. `public-contact` — Formulaire contact
4. `public-trust` — Page /trust (transparence)
5. `public-status` — Page /status (santé publique)

### HQ — Owner uniquement (6)
6. `hq-auth-login` — Login Owner réussi
7. `hq-briefing-room` — Briefing Room charge sans erreur
8. `hq-cockpit` — Cockpit Dirigeant
9. `hq-finance` — Page Finance + widget AI Cost
10. `hq-diagnostics` — Diagnostics + widget Reliability (DLQ + p95)
11. `hq-securite` — Page Sécurité

### Infrastructure (1)
12. `infra-healthz` — `/functions/v1/healthz` retourne 200 + JSON valide
