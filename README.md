# EMOTIONSCARE SASU — Siège Social Numérique
> **"Système d'exploitation du Président"** — Plateforme de gouvernance centralisée pour 7 produits SaaS

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)](https://supabase.com/)
[![Edge Functions](https://img.shields.io/badge/Edge_Functions-16_deployed-blue)](https://supabase.com/docs/guides/functions)
[![E2E Tests](https://img.shields.io/badge/E2E-Playwright_12_specs-45ba4b)](.github/workflows/e2e.yml)
[![Lint & Typecheck](https://img.shields.io/badge/CI-Lint_%2B_Typecheck-brightgreen)](.github/workflows/lint-typecheck.yml)
[![Audit Score](https://img.shields.io/badge/Audit-9.3%2F10_(H3)-success)]()
[![Status](https://img.shields.io/badge/Status-Beta_Privée-orange)]()

> **GitHub Secrets requis pour CI** : `PLAYWRIGHT_HQ_EMAIL`, `PLAYWRIGHT_HQ_PASSWORD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 📋 Vision

Le **HQ (Headquarters)** est un centre de commandement numérique conçu pour permettre à la Présidente d'EMOTIONSCARE SASU de piloter l'ensemble de ses plateformes sans jamais avoir à manipuler GitHub, Supabase ou d'autres outils techniques.

**Philosophie fondamentale : "Zéro technique pour le Président"**
- Le HQ analyse et propose des actions
- Le Président décide et approuve
- L'IA exécute avec supervision

---

## ⚡ Statut Actuel

> **Version Beta Privée** — La plateforme est en phase de déploiement progressif.

### Modules Opérationnels
- ✅ Briefing Room (Dashboard exécutif avec KPIs temps réel)
- ✅ Executive AI Runs (7 types : brief quotidien, standup, audit sécurité, veille concurrentielle...)
- ✅ Plateformes (monitoring des 7 SaaS avec GitHub sync)
- ✅ Engineering (commits, PRs, issues GitHub)
- ✅ Audit Log (journal des actions système)
- ✅ Approbations (workflow de validation)
- ✅ Finance (KPIs Stripe — nécessite connexion Stripe)

### Modules en Développement
- 🔧 Ventes, Marketing, Support, Réunions, RH, Data Analytics, Conformité

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

## 🚀 Les 7 Plateformes Managées

| Plateforme | Description | Status |
|------------|-------------|--------|
| **EmotionsCare** | Plateforme de gestion du bien-être émotionnel pour les professionnels de santé | ✅ Production |
| **NEARVITY** | Connexion sociale étudiants avec radar temps réel | 🚧 Prototype |
| **System Compass** | Plateforme d'aide à la décision pour relocalisation internationale | ✅ Production |
| **Growth Copilot** | Growth OS avec 39 employés IA répartis dans 11 départements | ✅ Production |
| **Med MNG** | Plateforme anti-panique cognitive pour étudiants en médecine | ✅ Production |
| **UrgenceOS** | Système d’exploitation des urgences hospitalières | 🚧 Prototype |
| **Track Triumph** | Compétition musicale communautaire et classements | ✅ Production |

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

**Résultats actuels** : 129 tests passants dans 13 fichiers de test
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

### Historique des versions
Consultez les [commits](https://github.com/laeticiamng/pr-sident-tableau-de-bord/commits/main/) pour l'historique détaillé des changements.

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

Propriétaire — © 2026 EMOTIONSCARE SASU. Tous droits réservés.

---

<p align="center">
  <strong>Built with ❤️ using <a href="https://lovable.dev">Lovable</a></strong>
</p>
