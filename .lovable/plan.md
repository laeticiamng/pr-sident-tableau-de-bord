

# Audit complet pré-production — EMOTIONSCARE HQ

## Score global estimé : 7.5/10

---

## 1. SECURITE (P0)

### 1.1 RLS Policies RESTRICTIVE-only (CRITIQUE)
Le scan de sécurité révèle que **toutes les RLS policies sont de type RESTRICTIVE**, ce qui les rend **non-fonctionnelles**. En PostgreSQL, les policies RESTRICTIVE ne font que restreindre l'accès déjà accordé par des policies PERMISSIVE. Sans aucune policy PERMISSIVE, toutes les policies renvoient `false` pour tous les rôles.

**Tables impactées** : `analytics_events`, `user_roles`, `role_permissions`, `contact_messages`

**Impact** : L'application fonctionne uniquement parce que les appels passent par `service_role` (RPC SECURITY DEFINER), masquant complètement le problème. Si un accès direct client est tenté, il sera silencieusement bloqué.

**Correction** : Convertir les policies d'accès intentionnel (ex: "Anyone can insert analytics events", "Authenticated users view own roles") de RESTRICTIVE en PERMISSIVE. Garder les policies de blocage (ex: "Deny anon access") en RESTRICTIVE.

### 1.2 contact_messages sans INSERT policy
La table `contact_messages` n'a aucune policy INSERT. Les soumissions de formulaire de contact ne peuvent passer que via `service_role`. Si l'Edge Function `contact-form` est le seul point d'entrée, c'est un choix de design acceptable (gatekeeper pattern), mais il faut le documenter explicitement.

### 1.3 Extension dans le schéma public
`pg_net` est installé dans le schéma `public` au lieu d'un schéma dédié. C'est une limitation infrastructure — non actionnable.

### 1.4 Console.log dans les Edge Functions
**298 console.log** trouvés dans 12 Edge Functions. Certains loguent des IDs utilisateur (`Authenticated user: ${userId}`). Risque modéré de fuite d'information dans les logs de production.

**Correction** : Remplacer par des appels à `insert_hq_log` RPC ou supprimer les logs sensibles.

---

## 2. ARCHITECTURE & CODE (P1)

### 2.1 Sidebar HQ : 4 queries lourdes sur chaque page
`HQSidebar.tsx` (L90-93) charge `usePendingApprovals()`, `useRecentRuns(50)`, `usePlatforms()`, et `useAuditLogs(50)` sur **chaque page HQ**, même quand la section "Tous les services" est repliée.

**Correction** : Charger `useRecentRuns` et `useAuditLogs` uniquement quand `isExpanded === true`.

### 2.2 Duplication ThemeProvider / useTheme
`ThemeProvider.tsx` et `useTheme.ts` implémentent chacun leur propre gestion du thème avec le même `localStorage` key. Risque de désynchronisation.

**Correction** : Supprimer `useTheme.ts` et utiliser uniquement le context de `ThemeProvider`.

### 2.3 Pas de signup — login only
`AuthPage.tsx` n'offre que la connexion. Aucune page d'inscription n'existe. C'est cohérent avec le modèle "owner-only" mais doit être documenté comme choix intentionnel.

### 2.4 RBAC route-level incomplet
`ProtectedRoute.tsx` vérifie qu'un utilisateur a "au moins un rôle" mais ne filtre pas par module. Un utilisateur avec le rôle `viewer` peut accéder à `/hq/finance` ou `/hq/securite`. Les hooks `useCanAccessModule` existent mais ne sont pas connectés aux routes.

**Correction** : Ajouter un wrapper par route qui vérifie `useCanAccessModule(module)`.

---

## 3. PERFORMANCE (P1)

### 3.1 Bundle splitting
Déjà en place avec `manualChunks` pour recharts et radix-ui. Le lazy loading est actif sur toutes les pages HQ et légales. **OK**.

### 3.2 Images
`LazyImage` composant avec IntersectionObserver. Previews des plateformes en JPG sans version WebP/AVIF. Pas de `srcSet` pour le responsive.

**Amélioration** : Convertir les previews en WebP et ajouter des dimensions width/height explicites pour éviter le CLS.

### 3.3 React Query staleTime
Configuré à 5 minutes globalement. Les données HQ ont aussi `refetchInterval: 5min`. Pas de `refetchOnWindowFocus: false` par hook (mais configuré globalement). **OK**.

---

## 4. SEO & MARKETING (P1)

### 4.1 SEO technique
- `index.html` : JSON-LD complet (Organization, WebSite, FAQPage, ItemList, AboutPage, BreadcrumbList). **Excellent**.
- `robots.txt` : Correct — bloque `/hq/`, `/dashboard/`, `/auth`. Couvre les bots IA (GPTBot, ClaudeBot, PerplexityBot). **Excellent**.
- `sitemap.xml` : 12 URLs, lastmod cohérent. **OK**.
- OG/Twitter cards : Complets avec image 1200x630. **OK**.
- `usePageMeta` : Canonical dynamique, noindex sur HQ. **OK**.

### 4.2 Points d'amélioration SEO
- Pas de `hreflang` dans le HTML pour les 3 langues (FR/EN/DE). Le JSON-LD mentionne `inLanguage` mais les balises `<link rel="alternate" hreflang="...">` manquent.
- Le titre dans `<title>` est statique et ne change pas par page côté HTML initial (SSR absent, mais le hook usePageMeta corrige côté client).

---

## 5. ACCESSIBILITE (P2)

### 5.1 aria-labels
Seule `HomePage.tsx` utilise `aria-label` et `aria-hidden`. Les autres pages (Vision, Tarifs, Contact, Trust, Status) n'ont aucun attribut ARIA sur les sections.

### 5.2 Contraste
Les textes en `text-white/60` et `text-white/70` sur fond gradient risquent de ne pas atteindre le ratio WCAG AA (4.5:1).

### 5.3 Focus management
Pas de `focus-visible` custom ni de skip-to-content link.

---

## 6. CONFORMITE LEGALE (P1)

### 6.1 Cookie consent
Bannière RGPD complète avec 3 options (accepter tout, refuser tout, personnaliser). Lien vers la politique cookies et la politique de confidentialité. **OK**.

### 6.2 Pages légales
Les 5 pages légales requises sont présentes : Mentions légales, Confidentialité, CGV, Registre RGPD, Cookies. **OK**.

### 6.3 Formulaire de contact
Pas de case à cocher de consentement RGPD sur le formulaire de contact. En vertu du RGPD, le consentement explicite est requis pour le traitement des données personnelles.

**Correction** : Ajouter une checkbox "J'accepte la politique de confidentialité" obligatoire.

---

## 7. QUALITE DU CODE (P2)

### 7.1 Tests
160 tests passent. Couverture estimée à ~30-40% (pas de threshold bloquant en CI). Les tests couvrent les hooks critiques (useAuth, usePermissions, useStripeKPIs) et les composants clés.

### 7.2 CI/CD
Pipeline GitHub Actions avec lint, typecheck, tests, audit de sécurité et build. Threshold de couverture à 50% mais non-bloquant (warning only). **OK**.

### 7.3 Error Boundaries
ErrorBoundary global + ErrorBoundary par route dans HQLayout. Stack traces masquées en production. **Excellent**.

---

## 8. PWA (P2)

Manifest complet, service worker avec push notifications, cache strategy NetworkFirst pour les APIs. `navigateFallbackDenylist` exclut `/~oauth`. **OK**.

---

## RESUME — Actions par priorité

```text
┌────┬──────────────────────────────────────────────────────┬─────┐
│ P  │ Action                                               │ Est │
├────┼──────────────────────────────────────────────────────┼─────┤
│ P0 │ Fix RLS: convertir policies d'accès en PERMISSIVE   │ 2h  │
│ P1 │ Sidebar: lazy-load queries secondaires              │ 1h  │
│ P1 │ RBAC: connecter useCanAccessModule aux routes HQ    │ 3h  │
│ P1 │ Edge Functions: nettoyer 298 console.log sensibles  │ 2h  │
│ P1 │ Contact form: ajouter checkbox consentement RGPD    │ 1h  │
│ P1 │ SEO: ajouter balises hreflang FR/EN/DE              │ 1h  │
│ P2 │ Images: convertir previews en WebP + width/height   │ 2h  │
│ P2 │ A11y: aria-labels sections + skip-to-content        │ 2h  │
│ P2 │ Supprimer duplication useTheme.ts vs ThemeProvider   │ 1h  │
└────┴──────────────────────────────────────────────────────┴─────┘
```

**Verdict** : Le projet est solide pour un MVP/Seed (score 7.5/10). Le bloqueur P0 est la correction des RLS policies RESTRICTIVE qui créent un faux sentiment de sécurité. Les P1 sont recommandés avant publication pour un standard "production utilisable".

