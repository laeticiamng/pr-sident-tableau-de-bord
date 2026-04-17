
## Cadrage stratégique — Horizon 3 : Industrialisation & Gouvernance avancée

### État des lieux (post H0+H1+H2)
- **Sécurité** : 8.5/10 — RLS purgé, audit immutable, HIBP actif
- **Robustesse** : Circuit-breaker AI Gateway + DLQ + retry exponentiel opérationnels
- **Observabilité** : `/healthz` public, p95 metrics, ReliabilityWidget
- **Tests** : 12 specs Playwright + 150+ tests Vitest
- **Score global estimé** : **8.8/10**

### Diagnostic des dettes résiduelles
1. **Pas de SLO formels** ni d'error budget tracking — pilotage sans cible mesurable
2. **CI/CD fragile** — Playwright créé mais aucun workflow GitHub Actions ne l'exécute
3. **`executive-run/index.ts` toujours 862 lignes** — extraction _shared/ partielle (gateway+breaker OK, templates+persistence pas faits)
4. **Pas de page gouvernance unifiée** — score audit, findings, roadmap éparpillés dans docs
5. **Coûts IA non ventilés** par run_type/agent dans l'UI (Top-5 absent)
6. **Extensions Postgres** dans schéma `public` (warning linter persistant)
7. **Pas de runbooks** pour incidents (DLQ saturée, breaker OPEN, budget dépassé)

### Proposition Horizon 3 — 4 axes

```text
┌─────────────────────────────────────────────────────────┐
│ AXE 1 — SLO & Error Budget                              │
│  • Table hq.slo_targets (cible, fenêtre, error_budget)  │
│  • RPC get_hq_slo_status (consommation budget restant)  │
│  • Widget /hq/diagnostics : 4 SLO (uptime, p95, success │
│    rate runs, freshness data)                           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ AXE 2 — Page /hq/governance unifiée                     │
│  • Score audit live (calculé depuis findings ouverts)   │
│  • Roadmap H0/H1/H2/H3 avec progression réelle          │
│  • Historique migrations sécurité (timeline)            │
│  • Top-5 runs gourmands (ventilation coût AI)           │
│  • Liens runbooks                                        │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ AXE 3 — Industrialisation CI/CD                         │
│  • .github/workflows/e2e.yml (Playwright sur PR + main) │
│  • .github/workflows/lint-typecheck.yml                 │
│  • Badge status dans README                             │
│  • Secrets GitHub à documenter (PLAYWRIGHT_HQ_*)        │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ AXE 4 — Refactor executive-run final                    │
│  • Extraction _shared/run-templates.ts (29 templates)   │
│  • Extraction _shared/run-persistence.ts (insert+log)   │
│  • Extraction _shared/run-validation.ts (Zod schemas)   │
│  • index.ts cible : <250 lignes (orchestration pure)    │
└─────────────────────────────────────────────────────────┘
```

### Détails techniques (par axe)

**Axe 1 — SLO** : 4 cibles standards SaaS
- Uptime API ≥ 99.5% (mesuré via /healthz polling)
- p95 run duration ≤ 30s
- Run success rate ≥ 95% (sur 7j glissants)
- Data freshness (dernier run < 24h) ≥ 99%

**Axe 2 — /hq/governance** : page React unique consommant `get_hq_governance_dashboard()` RPC qui agrège : findings (linter+sécurité), migrations sécurité (filtre `security` dans nom fichier), top-5 coûts (extension de `get_hq_ai_budget_status`), avancement roadmap (lecture `hq.system_config.roadmap_progress`).

**Axe 3 — CI/CD** : 2 workflows GitHub Actions, déclenchement sur `pull_request` + `push main`. Secrets nécessaires : `PLAYWRIGHT_HQ_EMAIL`, `PLAYWRIGHT_HQ_PASSWORD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

**Axe 4 — Refactor** : préserve la signature publique de `executive-run` (rétro-compat 100%). Tests existants (`index_test.ts`) doivent rester verts.

### Décisions à valider
1. **Périmètre H3** : exécuter les 4 axes ou prioriser ?
2. **SLO cibles** : valider les 4 seuils proposés ou ajuster ?
3. **Workflows CI** : OK pour ajouter les secrets Playwright dans GitHub Actions côté Président ?
4. **Page gouvernance** : route `/hq/governance` (nouvelle) ou intégrer dans `/hq/securite` existante ?

### Estimation
- **Effort total H3** : ~6 jours
- **ROI attendu** : score global passe de 8.8 → **9.3/10** (niveau "audit Big4 ready")
- **Risque** : faible (refactor isofonctionnel + ajouts non destructifs)

### Hors scope H3 (reportés H4)
- Multi-tenancy (1 seul utilisateur owner aujourd'hui)
- Internationalisation des messages d'erreur edge functions
- Migration extensions Postgres → schéma `extensions` (warning info only)
- Rate-limiting global par IP sur edge functions publiques
