

# AUDIT TECHNIQUE — POST-CORRECTIFS (Mars 2026)

## RÉSUMÉ EXÉCUTIF

**Verdict : NON EN L'ÉTAT — mais nettement amélioré**

Les correctifs P0 précédents (RLS PERMISSIVE, forwardRef, sidebar i18n) sont **confirmés en production** :
- Les policies `permissive_*` sont bien PERMISSIVE dans la base (vérifié via SQL direct)
- PublicFooter et CookieConsentBanner utilisent forwardRef
- HQSidebar et UserManagementPage sont internationalisés

### Problèmes restants critiques

**P0 restants : 1**
1. `verify_jwt = false` sur 15 Edge Functions — non modifiable (config.toml auto-généré), le code applicatif protège mais pas l'infra

**P1 restants : 4**
1. **~15 pages/composants HQ entièrement hardcodés en français** — MessagesPage, MarketingPage, HQPlateformesPage, NotificationCenter, AgentMonitoringDashboard, HQChatSidebar, RunResultPanel, AuditExportButton, ApprovalHistory, RunExportButton, ReleaseChecklist, RoadmapExportButton, RecentDecisionsWidget
2. **MobileHQHeader** : aria-labels FR hardcodés ("Fermer le menu"/"Ouvrir le menu")
3. **CRON_SECRET** non configuré — scheduled-runs inopérant
4. **Aucun monitoring externe** (Sentry absent)

---

## TABLEAU DES ISSUES RESTANTES

| Priorité | Domaine | Fichier / Composant | Problème | Faisable ? |
|----------|---------|---------------------|----------|------------|
| P0 | Security | config.toml | verify_jwt=false sur 15 fonctions | Non (auto-généré) |
| P1 | i18n | MessagesPage.tsx | ~20 strings FR hardcodées (toasts, empty states, labels) | Oui |
| P1 | i18n | MarketingPage.tsx | "Aucun plan généré", dates locale:fr fixe | Oui |
| P1 | i18n | HQPlateformesPage.tsx | "Aucun détail disponible" et autres | Oui |
| P1 | i18n | NotificationCenter.tsx | "Aucune notification", "Connexion en cours" | Oui |
| P1 | i18n | AgentMonitoringDashboard.tsx | "Erreur inconnue" et autres | Oui |
| P1 | i18n | HQChatSidebar.tsx | "Erreur de connexion au DG IA" | Oui |
| P1 | i18n | RunResultPanel.tsx | "Erreur lors de la copie" | Oui |
| P1 | i18n | AuditExportButton.tsx | "Aucun log à exporter", "Erreur d'export" | Oui |
| P1 | i18n | ApprovalHistory.tsx | "Aucune décision enregistrée" | Oui |
| P1 | i18n | RunExportButton.tsx | "Aucune donnée", "Aucun run à exporter" | Oui |
| P1 | i18n | RoadmapExportButton.tsx | "Export impossible", "Aucune donnée" | Oui |
| P1 | i18n | RecentDecisionsWidget.tsx | Hardcoded FR object (partial — has FR object but no i18n hook) | Oui |
| P1 | i18n | ReleaseChecklist.tsx | Labels/descriptions FR hardcodés | Oui |
| P2 | i18n | MobileHQHeader.tsx | aria-label "Fermer/Ouvrir le menu" hardcodé | Oui |
| P1 | Infra | scheduled-runs | CRON_SECRET non configuré | Nécessite ajout secret |
| P1 | Observability | Global | Pas de Sentry | Décision produit |

---

## PLAN D'ACTION PROPOSÉ

### Phase 1 — i18n HQ complet (implémentable immédiatement)

1. **Créer `src/i18n/hq-common.ts`** — fichier de traductions partagé pour les strings communes du HQ (toasts d'erreur, empty states, labels récurrents comme "Aucun", "Erreur", "Chargement", "Exporter", etc.)

2. **Intégrer useTranslation dans les 13 composants/pages listés** — remplacer chaque string FR hardcodée par une référence au fichier i18n correspondant

3. **MobileHQHeader** — ajouter aria-labels traduits

### Phase 2 — Infra (nécessite action utilisateur)

4. **CRON_SECRET** — configurer le secret via l'outil add_secret
5. **Sentry** — décision produit à prendre

### Ce qui NE sera PAS modifié
- config.toml (auto-généré, verify_jwt non modifiable)
- Stripe configuration (lecture seule, fonctionne)
- Architecture RLS (confirmée correcte)
- Edge Functions code (sécurité applicative déjà en place)

### Estimation
L'internationalisation des 13 composants restants est le travail principal. Je propose de le faire en créant un fichier i18n partagé pour le HQ et de mettre à jour chaque composant séquentiellement.

