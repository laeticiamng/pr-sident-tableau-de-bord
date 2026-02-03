# Guide des Modules HQ

> Documentation technique et fonctionnelle des 16 modules du Siège Social Numérique

---

## 📊 Vue d'ensemble

Le HQ est organisé en **3 catégories** de modules :

| Catégorie | Modules | Description |
|-----------|---------|-------------|
| **Gouvernance** | Briefing Room, Approbations, Audit, Diagnostics, Équipe, Réunions | Pilotage et contrôle |
| **Départements** | Finance, Ventes, Marketing, Produit, Engineering, Support, Sécurité, Plateformes | Opérations métier |
| **Profil** | Entreprise, Historique, Cockpit | Configuration et historique |

---

## 🏠 Gouvernance

### Briefing Room (`/hq`)
**Objectif** : Dashboard exécutif avec vue consolidée des KPIs

**Composants** :
- `ExecutiveCockpit` : Ring de KPIs (MRR, Tickets, Uptime, Runs)
- `AIInsightsWidget` : Suggestions IA personnalisées
- `LiveStatusWidget` : Statut temps réel des plateformes
- `RunQueueWidget` : Progression des runs en cours

**Données** :
- Stripe KPIs via `useStripeKPIs`
- Platform status via `useHQData`
- Recent runs via `get_hq_recent_runs`

---

### Approbations (`/hq/approbations`)
**Objectif** : Valider les actions proposées par les agents IA

**Fonctionnalités** :
- Liste des actions en attente
- Filtrage par niveau de risque
- Approbation/Rejet avec commentaire
- Historique des décisions

**API** :
- `get_hq_pending_actions()` : Actions en attente
- `approve_hq_action()` : Validation/Rejet

---

### Audit Log (`/hq/audit`)
**Objectif** : Journal immuable des actions système

**Colonnes** :
- Horodatage
- Acteur (owner/agent/system)
- Action (run.created, config.updated, etc.)
- Ressource concernée
- Détails JSON

**API** :
- `get_hq_audit_logs(limit)` : Dernières entrées

---

### Diagnostics (`/hq/diagnostics`)
**Objectif** : Monitoring technique des plateformes

**Métriques** :
- Uptime par plateforme
- Latence Edge Functions
- Erreurs récentes
- Santé base de données

---

### Équipe Exécutive (`/hq/equipe-executive`)
**Objectif** : Gestion des 21 agents IA

**Organisation** :
- **C-Suite** (10) : CEO, COO, CTO, CFO, CMO, CISO, CPO, CDO, CRO, CLO
- **Responsables** (6) : Engineering, QA, Design, Data, Support, People
- **GMs** (5) : Un par plateforme

**Actions** :
- Activer/Désactiver un agent
- Lancer une action via agent
- Configurer les préférences modèle

---

### Réunions (`/hq/reunions`)
**Objectif** : Planification et comptes-rendus

**Fonctionnalités** :
- Calendrier des réunions
- Génération automatique de comptes-rendus IA
- Export PDF

---

## 💼 Départements

### Finance (`/hq/finance`)
**Objectif** : Vue financière consolidée

**KPIs Stripe** :
- MRR (Monthly Recurring Revenue)
- Abonnements actifs
- Taux de churn
- Nouveaux clients

**Sources** :
- API Stripe via `stripe-kpis` Edge Function
- Données comptables (à configurer)

---

### Ventes (`/hq/ventes`)
**Objectif** : Pipeline commercial

**Métriques** :
- Revenus mensuels
- Deals actifs
- Taux de conversion
- Clients actifs

**Intégrations futures** :
- HubSpot CRM
- Pipedrive

---

### Marketing (`/hq/marketing`)
**Objectif** : Performance acquisition

**Métriques** :
- Visiteurs mensuels
- Taux de conversion
- Emails envoyés
- Engagement social

**Intégrations futures** :
- Google Analytics
- Mailchimp

---

### Produit (`/hq/produit`)
**Objectif** : Roadmap et features

**Composants** :
- OKRs par objectif
- Features (livrées, en cours, bloquées)
- Releases à venir
- Feature requests

**Intégrations futures** :
- Jira / Linear

---

### Engineering (`/hq/engineering`)
**Objectif** : Activité développement

**Métriques GitHub** :
- Commits récents
- Pull requests
- Issues ouvertes
- Branches actives

**API** :
- `github-sync` Edge Function

---

### Support (`/hq/support`)
**Objectif** : Tickets et satisfaction

**KPIs** :
- Tickets ouverts
- Temps de réponse moyen
- Taux de résolution
- NPS / CSAT

**Intégrations futures** :
- Zendesk
- Freshdesk

---

### Sécurité (`/hq/securite`)
**Objectif** : Audit et vulnérabilités

**Composants** :
- Score sécurité global
- Audit RLS automatisé
- Alertes vulnérabilités
- Conformité RGPD

---

### Plateformes (`/hq/plateformes`)
**Objectif** : Vue détaillée des 5 SaaS

**Par plateforme** :
- Statut (Production/Prototype)
- Uptime 24h
- Derniers commits
- Métriques spécifiques

---

## ⚙️ Profil

### Entreprise (`/hq/entreprise`)
**Objectif** : Données légales SASU

**Informations** :
- Raison sociale
- SIREN/SIRET
- Adresse siège
- Capital social
- Dirigeants

---

### Historique (`/hq/historique`)
**Objectif** : Historique des runs IA

**Colonnes** :
- Date/Heure
- Type de run
- Agent directeur
- Plateforme concernée
- Statut (terminé/erreur)
- Résumé exécutif

---

### Cockpit (`/hq/cockpit`)
**Objectif** : Contrôle opérationnel avancé

**Composants** :
- Autopilot Control (On/Off/Pause)
- Scheduler Panel (runs programmés)
- AI Transparency Panel (explications IA)
- Executive Cockpit (KPIs consolidés)

---

## 🔗 Intégrations

| Système | Statut | Module cible |
|---------|--------|--------------|
| Stripe | ✅ Connecté | Finance |
| GitHub | ✅ Connecté | Engineering |
| Lovable AI | ✅ Actif | Tous |
| Perplexity | ✅ Connecté | Veille |
| Firecrawl | ✅ Connecté | Web Scraping |
| HubSpot | 🔜 Planifié | Ventes |
| Google Analytics | 🔜 Planifié | Marketing |
| Zendesk | 🔜 Planifié | Support |
| Jira/Linear | 🔜 Planifié | Produit |

---

## 🛡️ Sécurité

Tous les modules respectent :
- Row Level Security (RLS) sur toutes les tables
- Vérification `is_owner()` pour les données sensibles
- Audit log automatique des actions critiques
- Validation Zod côté client
- Sanitization XSS

---

*Guide mis à jour le 03/02/2026 — Version 1.0*
