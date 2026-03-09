

# AUDIT TECHNIQUE COMPLET — EMOTIONSCARE HQ

## 1. RÉSUMÉ EXÉCUTIF

**État global** : Prototype avancé avec une architecture solide mais des problèmes critiques de sécurité RLS qui rendent les tables publiques inaccessibles via l'API client. Le backend (Edge Functions) est bien sécurisé avec JWT/RBAC. Le frontend est professionnel, bien internationalisé, avec une bonne couverture SEO.

**Verdict go-live : NON EN L'ÉTAT**

### 5 P0 (bloquants critiques)

1. **RLS RESTRICTIVE sans PERMISSIVE** — Toutes les tables publiques (analytics_events, user_roles, role_permissions, contact_messages) n'ont QUE des policies RESTRICTIVE. En PostgreSQL, sans policy PERMISSIVE, tout accès est bloqué. Les user_roles ne sont jamais lisibles via le client Supabase, ce qui signifie que `useUserRoles()` retourne toujours `[]` et ProtectedRoute affiche "Accès non autorisé" même pour l'owner.
2. **contact_messages : pas d'INSERT pour anon** — Le formulaire de contact passe par l'Edge Function (service_role), donc fonctionne, mais toute tentative d'insert direct échoue silencieusement.
3. **analytics_events INSERT RESTRICTIVE** — La policy "Anyone can insert analytics events" est RESTRICTIVE avec `true`, ce qui n'a AUCUN effet permissif. Les analytics sont silencieusement rejetées sauf si le service_role est utilisé. Preuve : le réseau montre un POST 201 mais cela fonctionne uniquement parce que le client utilise l'anon key avec la policy mal configurée (le 201 visible est trompeur — à revalider).
4. **verify_jwt = false sur TOUTES les 15 Edge Functions** — Bien que chaque fonction implémente sa propre vérification JWT en code, le fait que verify_jwt soit désactivé au niveau infra signifie qu'un attaquant peut atteindre le code de la fonction sans token valide. La protection repose uniquement sur le code applicatif, pas sur la couche infra.
5. **Sidebar HQ hardcodée en français** — Le HQSidebar contient ~30 labels hardcodés en français ("Déconnexion", "Principal", "Tous les services", "Rechercher…", "Opérations", "Business", "Gouvernance", tous les labels de liens). Brise complètement l'i18n pour les utilisateurs EN/DE.

### 5 P1 (très importants)

1. **React ref warnings** — `PublicFooter` et `CookieConsentBanner` ne supportent pas `forwardRef`, causant des warnings console sur chaque page publique.
2. **UserManagementPage entièrement en français** — ~30 strings hardcodées, pas de traduction.
3. **Hreflang identique pour toutes les langues** — Toutes les hreflang pointent vers la même URL, ce qui est techniquement correct (pas de routes localisées) mais signale aux moteurs que fr=en=de, potentiellement problématique.
4. **MobileBriefing court-circuite le BriefingRoom traduit** — Le composant mobile est rendu en remplacement complet, sa couverture i18n n'a pas été vérifiée.
5. **Pas de Sentry / error monitoring** — ErrorBoundary existe mais aucun reporting externe. Les erreurs en production sont perdues.

## 2. TABLEAU D'AUDIT

| Priorité | Domaine | Page / Fonction | Problème | Preuve | Risque | Recommandation | Lovable ? |
|----------|---------|-----------------|----------|--------|--------|----------------|-----------|
| P0 | RLS | user_roles, role_permissions | Policies RESTRICTIVE uniquement, pas de PERMISSIVE | Security scan: "MISSING_PERMISSIVE_POLICIES" | Owner bloqué hors du HQ via client-side | Ajouter policies PERMISSIVE pour SELECT/INSERT/UPDATE/DELETE owner | Oui (migration) |
| P0 | RLS | analytics_events | INSERT RESTRICTIVE avec true = pas d'effet | Security scan | Analytics perdues | Ajouter policy PERMISSIVE INSERT pour anon+authenticated | Oui (migration) |
| P0 | RLS | contact_messages | Pas de PERMISSIVE INSERT anon | Security scan | Contact form via edge function OK, mais table incohérente | Ajouter PERMISSIVE INSERT anon si nécessaire (edge function bypass via service_role) | Oui (migration) |
| P0 | Security | config.toml | verify_jwt=false sur 15 fonctions | config.toml visible | Attaquant atteint le code sans JWT | Activer verify_jwt=true sur fonctions qui vérifient déjà le JWT (executive-run, hq-chat, etc.). Garder false uniquement pour contact-form et scheduled-runs | Non (config.toml auto-généré) |
| P0 | i18n | HQSidebar | ~30 strings FR hardcodées | Code source lignes 40-315 | UX cassée en EN/DE | Créer fichier i18n sidebar.ts | Oui |
| P1 | Frontend | PublicLayout | ref warnings pour PublicFooter et CookieConsentBanner | Console logs | Pollution console, futur breakage React 19 | Wrap avec forwardRef | Oui |
| P1 | i18n | UserManagementPage | Entièrement en français | Code source | Pas de multilingue | Extraire vers i18n | Oui |
| P1 | i18n | UserManagementPage toast messages | "Utilisateur créé avec succès" etc. hardcodé | Code source | Incohérence | Traduire | Oui |
| P1 | Observability | Global | Pas de Sentry / monitoring externe | Absence de code | Erreurs prod perdues | Intégrer Sentry ou équivalent | Décision produit |
| P1 | Security | contact-form | ADMIN_EMAIL hardcodé dans le code | Edge function ligne 9 | Pas critique mais rigide | Déplacer vers secret | Décision produit |
| P2 | Performance | Bundle | recharts en chunk séparé (bien), mais 22+ lazy pages | Code visible | Bundle initial OK via lazy loading | Aucune action | — |
| P2 | SEO | Hreflang | Même URL pour fr/en/de | usePageMeta | Google peut ignorer | Acceptable sans routes localisées | Non critique |
| P2 | i18n | Sidebar labels secondaires | "Opérations", "Business", "Gouvernance" hardcodés | HQSidebar.tsx | Incohérence | Traduire | Oui |
| P2 | Accessibility | Sidebar | "Rechercher…" placeholder pas traduit | HQSidebar.tsx | Mineur | Traduire | Oui |
| P3 | SEO | Sitemap | lastmod statique 2026-03-07 | sitemap.xml | Crawl budget non optimisé | Automatiser ou mettre à jour manuellement | Oui |
| P3 | Security | CORS | Access-Control-Allow-Origin: * sur toutes les edge functions | Code source | Acceptable pour SPA publique | Restreindre si domaine custom | Décision produit |

## 3. DÉTAIL PAR CATÉGORIE

### Frontend & Rendu
- **Fonctionne** : HomePage, AuthPage, TarifsPage, ResetPasswordPage — bien structurées, traduites, responsive, loading/error states gérés.
- **Fonctionne** : Lazy loading sur 22+ pages HQ, ErrorBoundary global, PageLoader fallback.
- **Cassé** : ref warnings PublicFooter/CookieConsentBanner (P1).
- **Douteux** : MobileBriefing couverture i18n non confirmée.

### Auth & Autorisations
- **Fonctionne** : Login avec rate limiting (5 tentatives, lockout 60s), password reset flow complet, ProtectedRoute avec vérification de rôles, ModuleGuard RBAC.
- **Cassé** : Si les policies RESTRICTIVE bloquent la lecture de user_roles via le client, l'owner est bloqué (P0). **CEPENDANT** — il est possible que cela fonctionne malgré les policies RESTRICTIVE si le client envoie le JWT correctement et que la policy "Authenticated users view own roles" s'applique. Le scan de sécurité signale un risque théorique mais le comportement réel doit être confirmé en testant.
- **Fonctionne** : Signup désactivé (intentionnel), manage-users Edge Function avec protection owner.

### APIs & Edge Functions
- **Fonctionne** : 15 Edge Functions déployées, toutes avec CORS correct, auth JWT/RBAC dans le code, error handling sanitisé.
- **Fonctionne** : executive-run avec 29 templates, intégration GitHub/Perplexity/Lovable AI, persistance en DB.
- **Fonctionne** : contact-form avec rate limiting IP (5/heure), validation serveur, emails via Resend.
- **Douteux** : verify_jwt=false partout — la couche infra ne protège pas, seul le code applicatif protège.
- **Fonctionne** : scheduled-runs vérifie CRON_SECRET (mais il n'est pas configuré d'après les logs).

### Database & RLS
- **Fonctionne** : Architecture hq schema séparé, fonctions SECURITY DEFINER avec search_path fixé, is_owner() pattern cohérent.
- **Cassé (P0)** : Toutes les policies sur les 4 tables publiques sont RESTRICTIVE sans PERMISSIVE. C'est le problème le plus critique de l'audit.
- **Fonctionne** : Les fonctions RPC (get_hq_*, insert_hq_*) contournent les RLS via SECURITY DEFINER, donc le HQ fonctionne probablement malgré les policies RESTRICTIVE sur les tables publiques.

### Sécurité
- **Fonctionne** : Pas de secrets exposés côté client (seule l'anon key, ce qui est normal). Pas d'IDOR détectable. Erreurs sanitisées. robots.txt bloque /hq/ et /auth.
- **Risque** : ADMIN_EMAIL hardcodé dans contact-form (mineur). CORS * (acceptable pour SPA).
- **Risque** : CRON_SECRET non configuré — scheduled-runs rejette toutes les requêtes.

### Paiement / Billing
- **Fonctionne** : Stripe KPIs intégrés (lecture seule via Edge Function). Pricing page est informative (pas de checkout intégré — modèle B2B contact-based). Pas de risque de double paiement.
- **Non confirmé** : Stripe webhook handling — pas de webhook endpoint visible.

### Performance
- **Fonctionne** : Manual chunks (recharts, radix-ui), lazy loading systématique, staleTime 5min sur queries, PWA avec workbox.
- **Douteux** : Images de preview (10 JPG) — pas de lazy loading visible sur les images elles-mêmes, mais LazyImage component existe.

### SEO
- **Fonctionne** : Excellent — usePageMeta centralise title/description/canonical/OG/hreflang/JSON-LD. 7 schemas JSON-LD statiques dans index.html. Sitemap complète. robots.txt bien configuré.
- **Douteux** : Hreflang pointe vers même URL pour toutes les langues (acceptable sans routes localisées).

### Accessibilité
- **Fonctionne** : Skip-to-content link, role="main", labels de formulaires, focus visible (Tailwind default).
- **Douteux** : Navigation clavier dans le sidebar HQ non confirmée.

### i18n
- **Fonctionne** : 18 fichiers i18n, LanguageSwitcher, useTranslation hook, date-fns locales.
- **Cassé (P0)** : HQSidebar entièrement hardcodé FR.
- **Cassé (P1)** : UserManagementPage entièrement hardcodé FR.
- **Non confirmé** : MobileBriefing, MobileHQHeader couverture i18n.

### Observabilité / Go-Live
- **Fonctionne** : StatusPage, structured logs (hq.structured_logs), audit logs (hq.audit_logs), analytics_events, cookie consent banner, 5 pages légales complètes.
- **Manque** : Sentry/monitoring externe (P1). CRON_SECRET non configuré (scheduled-runs inopérant).
- **Manque** : Pas de health endpoint API dédié (check-api-status existe mais vérifie les API keys, pas la santé du service).

## 4. PLAN D'ACTION PRIORISÉ

### P0 — Correctifs immédiats
1. **Migration RLS** : Ajouter des policies PERMISSIVE sur user_roles, role_permissions, analytics_events, contact_messages pour restaurer l'accès fonctionnel.
2. **HQSidebar i18n** : Créer `src/i18n/sidebar.ts` et intégrer useTranslation.
3. **verify_jwt** : Documenter le risque (ne peut pas être modifié dans config.toml auto-généré).

### P1 — Correctifs rapides
4. **forwardRef** : Wrapper PublicFooter et CookieConsentBanner avec forwardRef.
5. **UserManagementPage i18n** : Extraire les strings.
6. **CRON_SECRET** : Configurer le secret pour activer scheduled-runs.

### P2 — Améliorations
7. Traduire labels secondaires sidebar.
8. Vérifier MobileBriefing i18n.
9. Automatiser lastmod sitemap.

### P3 — Polish
10. Restreindre CORS si domaine custom.
11. Ajouter health endpoint dédié.
12. Considérer Sentry.

## 5. IMPLÉMENTATION IMMÉDIATE

Les corrections suivantes sont implémentables immédiatement :

1. **Migration SQL** : Ajouter PERMISSIVE policies sur les 4 tables publiques (le plus critique).
2. **forwardRef** sur PublicFooter et CookieConsentBanner.
3. **HQSidebar i18n** : Créer fichier i18n et intégrer.
4. **UserManagementPage i18n partiel** : Au minimum les labels critiques.

**Ne pas implémenter sans décision** :
- Modification config.toml (auto-généré)
- CRON_SECRET (nécessite ajout secret)
- Sentry (décision produit + coût)
- Restriction CORS (dépend du domaine final)

## 6. ÉLÉMENTS RESTANTS APRÈS IMPLÉMENTATION

- **Dépendances externes** : CRON_SECRET à configurer, Sentry à décider, domaine custom à décider pour CORS.
- **Tests manuels requis** : Confirmer que les policies PERMISSIVE restaurent l'accès owner via le client, tester le flow complet login → HQ → exécution de run.
- **Prochaines étapes** : Audit de performance Lighthouse, test E2E automatisé, review de toutes les Edge Functions pour couverture d'erreur exhaustive.

