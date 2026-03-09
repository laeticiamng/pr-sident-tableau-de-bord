

# AUDIT TECHNIQUE POST-CORRECTIFS — MARS 2026 (V3)

## 1. RÉSUMÉ EXÉCUTIF

**Verdict : NON EN L'ÉTAT — Régression de sécurité P0 introduite par la migration précédente**

La migration `20260309063343` qui devait corriger le problème RLS a en réalité **créé des vulnérabilités de sécurité plus graves** : les policies `permissive_*` avec `USING (true)` permettent à **tout utilisateur authentifié** de lire, modifier et supprimer des données qui devraient être réservées à l'owner.

### P0 — Bloquants critiques (3)

1. **RLS : `permissive_select_contact_messages` (true)** — Tout utilisateur authentifié peut lire TOUS les messages de contact (noms, emails, téléphones). Fuite de données personnelles.
2. **RLS : `permissive_select_user_roles` (true)** — Tout utilisateur authentifié peut voir les rôles de TOUS les utilisateurs. Contourne la policy `user_id = auth.uid() OR is_owner()`.
3. **RLS : `permissive_delete_analytics` (true) + `permissive_delete/update_contact_messages` (true)** — Tout authentifié peut supprimer les analytics et modifier/supprimer les messages de contact.

### P1 — Très importants (4)

1. **VeillePage entièrement hardcodée FR** — ~100 strings FR (sources concurrentielles, trends, labels).
2. **JournalPage toasts hardcodés FR** — "Erreur IA", "Impossible d'analyser l'impact".
3. **PushNotificationSettings hardcodé FR** — "Notifications bloquées", "Notification envoyée".
4. **AITransparencyPanel hardcodé FR** — "Preuves obligatoires", "Aucune conjecture".

## 2. ANALYSE RLS DÉTAILLÉE

La migration précédente a converti les policies RESTRICTIVE originales en PERMISSIVE (correct) mais a AUSSI ajouté des policies `permissive_*` avec `USING (true)` qui annulent les filtres des policies originales.

**Mécanisme PostgreSQL** : Les PERMISSIVE policies sont combinées avec OR. Si une policy dit `is_owner()` et une autre dit `true`, le résultat est `is_owner() OR true = true`.

### Policies à SUPPRIMER (overly broad)

| Policy | Table | Problème |
|--------|-------|----------|
| `permissive_select_user_roles` | user_roles | `true` annule `user_id=uid OR is_owner()` |
| `permissive_select_role_permissions` | role_permissions | `true` annule le filtre par rôle |
| `permissive_select_analytics` | analytics_events | `true` annule `is_owner()` |
| `permissive_delete_analytics` | analytics_events | `true` annule `is_owner()` |
| `permissive_select_contact_messages` | contact_messages | `true` annule `is_owner()` |
| `permissive_update_contact_messages` | contact_messages | `true` annule `is_owner()` |
| `permissive_delete_contact_messages` | contact_messages | `true` annule `is_owner()` |

### Policies à GARDER (nécessaires pour le fonctionnement)

| Policy | Table | Raison |
|--------|-------|--------|
| `permissive_insert_user_roles` | user_roles | Nécessaire + RESTRICTIVE `is_owner()` filtre |
| `permissive_update_user_roles` | user_roles | Nécessaire + RESTRICTIVE `is_owner()` filtre |
| `permissive_delete_user_roles` | user_roles | Nécessaire + RESTRICTIVE `is_owner()` filtre |
| `permissive_insert_role_permissions` | role_permissions | Nécessaire + RESTRICTIVE filtre |
| `permissive_update_role_permissions` | role_permissions | Nécessaire + RESTRICTIVE filtre |
| `permissive_delete_role_permissions` | role_permissions | Nécessaire + RESTRICTIVE filtre |
| `permissive_insert_analytics` | analytics_events | Nécessaire pour anon insert |

## 3. PLAN D'ACTION

### Phase 1 — Migration RLS urgente (P0)

Exécuter une migration SQL pour supprimer les 7 policies `permissive_*` SELECT/DELETE/UPDATE trop larges. Les policies originales (maintenant PERMISSIVE) suffisent pour le filtrage correct.

```sql
DROP POLICY "permissive_select_user_roles" ON public.user_roles;
DROP POLICY "permissive_select_role_permissions" ON public.role_permissions;
DROP POLICY "permissive_select_analytics" ON public.analytics_events;
DROP POLICY "permissive_delete_analytics" ON public.analytics_events;
DROP POLICY "permissive_select_contact_messages" ON public.contact_messages;
DROP POLICY "permissive_update_contact_messages" ON public.contact_messages;
DROP POLICY "permissive_delete_contact_messages" ON public.contact_messages;
```

### Phase 2 — i18n restante (P1)

Les composants suivants nécessitent encore une internationalisation :
- `VeillePage.tsx` — ~100 strings (sources, trends, competitive map, labels)
- `JournalPage.tsx` — ~10 strings (toast messages)
- `PushNotificationSettings.tsx` — ~8 strings
- `AITransparencyPanel.tsx` — ~15 strings
- `PlatformAnalysisDialog.tsx` — ~5 strings

### Ce qui fonctionne correctement

- HQSidebar, UserManagementPage, MessagesPage, MarketingPage, HQPlateformesPage : i18n OK
- NotificationCenter, AgentMonitoringDashboard, HQChatSidebar, RunResultPanel : i18n OK
- Export buttons (Audit, Run, Roadmap, RGPD) : i18n OK
- ReleaseChecklist, MobileHQHeader, RecentDecisionsWidget : i18n OK
- PublicFooter, CookieConsentBanner : forwardRef OK
- ScrollReveal : forwardRef OK
- Auth flow, ProtectedRoute, ModuleGuard : fonctionnels
- Edge Functions : sécurité applicative OK (JWT/RBAC dans le code)

### Ce qui ne sera PAS modifié

- config.toml (auto-généré)
- Sentry (décision produit)
- CRON_SECRET (nécessite ajout secret)

