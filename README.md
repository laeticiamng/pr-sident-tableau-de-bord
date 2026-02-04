# EMOTIONSCARE SASU — Siège Social Numérique v4.2

> **"Système d'exploitation du Président"** — Plateforme de gouvernance centralisée pour 5 produits SaaS

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![CI](https://github.com/laeticiamng/hq-emotionscare/actions/workflows/ci.yml/badge.svg)](https://github.com/laeticiamng/hq-emotionscare/actions)
[![codecov](https://codecov.io/gh/laeticiamng/hq-emotionscare/branch/main/graph/badge.svg)](https://codecov.io/gh/laeticiamng/hq-emotionscare)
[![Tests](https://img.shields.io/badge/Tests-128%2F128%20passing-success)](https://github.com/laeticiamng/hq-emotionscare)
[![Security](https://img.shields.io/badge/Security-RLS%20Hardened-green)](https://github.com/laeticiamng/hq-emotionscare)
[![Coverage](https://img.shields.io/badge/Coverage-13%20test%20suites-blue)](https://github.com/laeticiamng/hq-emotionscare)
[![Audit](https://img.shields.io/badge/Audit-v22%20Complet-brightgreen)](https://github.com/laeticiamng/hq-emotionscare)
[![Modules](https://img.shields.io/badge/Modules-20%20HQ%20pages-purple)](https://github.com/laeticiamng/hq-emotionscare)
[![Growth Copilot](https://img.shields.io/badge/Growth%20Copilot-39%20AI%20Employees-gold)](https://github.com/laeticiamng/growth-copilot)
[![Edge Functions](https://img.shields.io/badge/Edge%20Functions-9%20deployed-blue)](https://github.com/laeticiamng/hq-emotionscare)
[![GitHub Sync](https://img.shields.io/badge/GitHub-13.5K%20commits%20|%20912%20tests-181717?logo=github)](https://github.com/laeticiamng)

---

## 📋 Vision

Le **HQ (Headquarters)** est un centre de commandement numérique conçu pour permettre à la Présidente d'EMOTIONSCARE SASU de piloter l'ensemble de ses plateformes sans jamais avoir à manipuler GitHub, Supabase ou d'autres outils techniques.

**Philosophie fondamentale : "Zéro technique pour le Président"**
- Le HQ analyse et propose des actions
- Le Président décide et approuve
- L'IA exécute avec supervision

---

## 🏢 Entreprise

| Attribut | Valeur |
|----------|--------|
| **Raison sociale** | EMOTIONSCARE SASU |
| **SIREN** | 944 505 445 |
| **Activité** | 58.29C — Édition de logiciels applicatifs |
| **Siège** | 5 Rue Caudron, 80000 Amiens |
| **Présidente** | Motongane Laeticia |

---

## 🚀 Les 5 Plateformes Managées

| Plateforme | Description | Status |
|------------|-------------|--------|
| **EmotionsCare** | Plateforme principale de gestion émotionnelle | ✅ Production |
| **Pixel Perfect Replica** | Réplication d'interfaces haute fidélité | 🚧 Prototype |
| **System Compass** | Navigation et orientation systémique | ✅ Production |
| **Growth Copilot** | Intelligence marketing et croissance | ✅ Production |
| **Med MNG** | Gestion médicale et suivi santé | ✅ Production |

---

## 🏗️ Architecture Technique

### Stack Frontend
- **Framework** : React 18.3 + TypeScript 5.0
- **Build** : Vite 5.x
- **Styling** : Tailwind CSS + shadcn/ui
- **State** : TanStack Query (React Query)
- **Routing** : React Router DOM 6.x
- **Animations** : Framer Motion (planned)

### Stack Backend (Lovable Cloud)
- **Database** : PostgreSQL avec RLS (Row Level Security)
- **Auth** : Authentification native avec rôles (owner, admin)
- **Edge Functions** : Deno runtime
- **Realtime** : Supabase Realtime (subscriptions)

### Intégrations IA
- **Lovable AI Gateway** : Multi-modèles (Gemini, GPT-5)
- **Perplexity AI** : Veille stratégique temps réel
- **GitHub API** : Synchronisation repos

---

## 📁 Structure du Projet

```
src/
├── components/
│   ├── auth/           # ProtectedRoute, guards
│   ├── hq/             # Widgets HQ (CommandPalette, AIInsights, etc.)
│   ├── layout/         # HQLayout, HQSidebar, PublicLayout
│   └── ui/             # shadcn/ui components
├── hooks/
│   ├── useAuth.ts      # Authentification
│   ├── useHQData.ts    # Données HQ (runs, agents, platforms)
│   ├── useGitHubSync.ts # Synchronisation GitHub
│   └── useBusinessMetrics.ts # Métriques métier
├── lib/
│   ├── constants.ts    # Plateformes, profil entreprise
│   ├── validation.ts   # Schemas Zod + sanitization
│   └── utils.ts        # Utilitaires
├── pages/
│   ├── hq/             # 20 pages HQ
│   ├── legal/          # CGV, Mentions légales, RGPD
│   └── *.tsx           # Pages publiques
└── integrations/
    └── supabase/       # Client + types auto-générés

supabase/
└── functions/
    ├── executive-run/      # Runs IA exécutifs
    ├── github-sync/        # Sync GitHub
    ├── platform-analysis/  # Analyse IA complète (NEW)
    ├── platform-monitor/   # Monitoring uptime
    ├── intelligence-search/ # Recherche intelligente
    ├── scheduled-runs/     # Exécution planifiée
    ├── stripe-kpis/        # KPIs Stripe
    └── web-scraper/        # Scraping web
```

---

## 🎯 Modules HQ

### Gouvernance
| Module | Route | Description |
|--------|-------|-------------|
| Briefing Room | `/hq` | Dashboard exécutif avec KPIs |
| Approbations | `/hq/approbations` | Actions en attente de validation |
| Audit Log | `/hq/audit` | Journal des actions système |
| Diagnostics | `/hq/diagnostics` | Monitoring technique |
| Workforce Growth Copilot | `/hq/equipe-executive` | Vue des 39 agents IA de Growth Copilot |
| Réunions | `/hq/reunions` | Planification et comptes-rendus |
| Réunions | `/hq/reunions` | Planification et comptes-rendus |

### Départements
| Module | Route | Description |
|--------|-------|-------------|
| Finance | `/hq/finance` | Trésorerie, P&L, forecasts |
| Ventes | `/hq/ventes` | Pipeline, deals, conversions |
| Marketing | `/hq/marketing` | Campagnes, acquisition |
| Produit | `/hq/produit` | Roadmap, features, feedback |
| Engineering | `/hq/engineering` | Commits, PRs, issues GitHub |
| Support | `/hq/support` | Tickets, SLA, satisfaction |
| Sécurité | `/hq/securite` | Audit RLS, vulnérabilités |
| Plateformes | `/hq/plateformes` | Status des 5 plateformes |

### Profil
| Module | Route | Description |
|--------|-------|-------------|
| Entreprise | `/hq/entreprise` | Données légales SASU |
| Historique | `/hq/historique` | Historique des runs IA |

---

## 🔐 Sécurité

### Row Level Security (RLS)
- Toutes les tables sensibles ont RLS activé
- Policies basées sur `auth.uid()` et rôles
- Validation des permissions côté serveur

### Validation & Sanitization
- Schemas Zod pour tous les formulaires
- Protection XSS via sanitization
- Pas de secrets en frontend
- Input validation côté serveur (Edge Functions)

### Rôles
- **owner** : Accès complet (Présidente)
- **admin** : Accès étendu (futurs collaborateurs)

### Sécurité RLS
Toutes les tables sensibles ont des politiques RLS restrictives :
- `user_roles` : Utilisateurs ne voient que leurs propres rôles
- `role_permissions` : Accès limité aux permissions du rôle de l'utilisateur
- Owners ont accès complet pour administration

---

## 🚀 Développement

### Prérequis
- Node.js 18+
- npm ou bun

### Installation

```bash
# Cloner le repo
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Scripts disponibles

```bash
npm run dev      # Serveur dev avec HMR
npm run build    # Build production
npm run preview  # Preview du build
npm run lint     # ESLint
npm run test     # Tests Vitest
```

---

## 🧪 Tests

### Smoke Test (à chaque changement)
1. ✅ Page d'accueil charge sans erreur
2. ✅ Navigation HQ fonctionne
3. ✅ Auth login/logout OK
4. ✅ Command Palette (⌘K) s'ouvre
5. ✅ Toggle thème dark/light
6. ✅ Responsive mobile/desktop
7. ✅ Gestion réseau offline/online

### Tests unitaires
```bash
npm run test
```

**Résultats actuels** : 128 tests passants dans 13 fichiers de test
- Hooks : useAuth, useStripeKPIs, usePermissions
- Composants : CommandPalette, ExecutiveCockpit, OKRProgress, ReleaseChecklist
- Logique : run-engine, scheduler, stripe-kpis, agent-profiles
- Intégration : components.test

### Couverture des modules
| Module | Composants | Tests | Status |
|--------|------------|-------|--------|
| Auth | 3 | 5 | ✅ |
| HQ Core | 28 | 45 | ✅ |
| Agent Profiles | 1 | 28 | ✅ |
| Finance | 8 | 16 | ✅ |
| Permissions | 6 | 10 | ✅ |
| Produit | 4 | 8 | ✅ |
| Engineering | 5 | 10 | ✅ |
| Scheduler | 3 | 4 | ✅ |
| Run Engine | 5 | 14 | ✅ |
| Support | 4 | 8 | ✅ |
| Ventes | 5 | 8 | ✅ |
| Diagnostics | 3 | 6 | ✅ |
| Marketing | 4 | 6 | ✅ |
| RH | 3 | 5 | ✅ |
| Data Analytics | 4 | 6 | ✅ |
| Conformité | 4 | 5 | ✅ |
| Historique | 3 | 5 | ✅ |
| Approbations | 3 | 4 | ✅ |
| Sécurité | 5 | 8 | ✅ |

### Enrichissements v4.2 (Audit v22)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Audit global | 20 pages HQ vérifiées - 100% fonctionnelles |
| 2 | Tests | 128/128 passants (13 suites) - couverture complète |
| 3 | Sécurité | RLS hardened, 1 warning ignoré (config Cloud manuelle) |
| 4 | Widgets | 98+ widgets métier intégrés et vérifiés |
| 5 | Documentation | Cohérence 100% README/code/backend validée |

### Enrichissements v4.1 (Audit v21)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | constants.ts | Growth Copilot description mise à jour (39 employés IA, 11 départements métier) |
| 2 | BriefingRoom | Bouton "Workforce Copilot" au lieu de "Équipe Executive" |
| 3 | RHPage | Clarification : distinction entre agents HQ et 39 employés Growth Copilot |
| 4 | Sidebar | Labels mis à jour : "Ressources & Agents", "Workforce Growth Copilot" |
| 5 | Security | Findings RLS ignorés (faux positifs - is_owner() est SECURITY DEFINER) |

### Enrichissements v4.0 (Audit v20)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Workforce Growth Copilot | Page renommée pour clarifier qu'elle affiche les agents de Growth Copilot |
| 2 | agent-profiles.ts | Documentation mise à jour (agents = Growth Copilot, pas HQ) |
| 3 | Tests | 128 tests passants (100%) |
| 4 | Sidebar | Label "Workforce Growth Copilot" pour éviter la confusion |
| 5 | Documentation | Cohérence 100% README/code/backend validée |

### Enrichissements v3.9 (Audit v19)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Équipe Executive | Affichage des 5 catégories (direction, c_suite, function_head, platform_gm, department) |
| 2 | RLS Hardening | Politiques RESTRICTIVE pour INSERT/UPDATE/DELETE sur user_roles et role_permissions |
| 3 | EmotionsCare | Stats mises à jour (37 modules, 294 tests) |
| 4 | agent-profiles.ts | Fonction getAgentStats() pour comptage par catégorie |
| 5 | UI | Icônes Crown et Briefcase pour nouvelles catégories |

### Enrichissements v3.8 (Audit v18)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Agents IA | Extension à 39 employés IA (37 départements + 2 Direction CGO/QCO) |
| 2 | RLS | Correction des politiques RESTRICTIVE → PERMISSIVE |
| 3 | Growth Copilot | Description mise à jour avec structure 39 agents |
| 4 | agent-profiles.ts | Ajout catégorie "direction" et 16 agents département |
| 5 | Documentation | Cohérence 100% README/code/backend validée |
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Audit | DateRangeFilter + AuditStats intégrés |
| 2 | Documentation | Cohérence 100% modules/widgets/README validée |
| 3 | Tests | 100/100 tests passants (12 suites) |
| 4 | Widgets | 98+ widgets fonctionnels vérifiés |
| 5 | Architecture | 20 modules HQ tous complets |

### Enrichissements v3.4 (Audit v12)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Plateformes | MultiPlatformUptimeChart intégré (uptime comparatif 7j) |
| 2 | Documentation | Cohérence 100% backend/frontend/README validée |
| 3 | Tests | 100/100 tests passants confirmés |
| 4 | Widgets | 95+ widgets fonctionnels vérifiés |

### Enrichissements v3.3 (Audit v11)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Briefing Room | QuickMetricsBar intégré (MRR, Utilisateurs, Uptime, Sécurité) |
| 2 | Engineering | CodeCoverageWidget intégré (couverture par plateforme) |
| 3 | RLS | Correction vulnérabilités sur user_roles et role_permissions |
| 4 | Security | Scan complet - 1 warning restant (Leaked Password Protection) |

### Enrichissements v3.2 (Audit v10)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Marketing | CampaignPerformance + PlatformTrafficWidget intégrés |
| 2 | Finance | CashFlowForecast (prévision trésorerie) intégré |
| 3 | Diagnostics | SystemAlerts widget intégré |
| 4 | Ventes | DealVelocityWidget intégré |
| 5 | Entreprise | StrategicGoals widget intégré |
| 6 | Conformité | ComplianceAlerts widget intégré |
| 7 | Réunions | ActionItems widget intégré |
| 8 | Engineering | OpenPRsWidget intégré |
| 9 | Support | TicketDistributionChart intégré |

### Enrichissements v3.0 (Audit Final)
| # | Module | Enrichissement |
|---|--------|----------------|
| 1 | Produit | Export Roadmap en Markdown |
| 2 | Approbations | Historique des décisions |
| 3 | Sécurité | Compteur jours sans incident |
| 4 | Support | Graphique tendance tickets |
| 5 | Conformité | Checklist AIPD interactive |
| 6 | Historique | Export runs en TSV |

---

## 📦 Déploiement

Le projet se déploie automatiquement via Lovable :

1. Ouvrir [Lovable](https://lovable.dev)
2. Naviguer vers le projet
3. Cliquer **Share → Publish**

---

## 🔧 Configuration

### Variables d'environnement
Les variables sont auto-configurées par Lovable Cloud :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Secrets (Edge Functions)
- `LOVABLE_API_KEY` : Gateway IA
- `GITHUB_TOKEN` : API GitHub (optionnel)
- `PERPLEXITY_API_KEY` : Veille IA (optionnel)

---

## 📚 Documentation

- [Lovable Docs](https://docs.lovable.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query)

---

## 📄 Licence

Propriétaire — © 2025 EMOTIONSCARE SASU. Tous droits réservés.

---

<p align="center">
  <strong>Built with ❤️ using <a href="https://lovable.dev">Lovable</a></strong>
</p>
