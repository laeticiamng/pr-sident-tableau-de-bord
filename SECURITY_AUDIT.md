# Audit Technique Sécurité — EMOTIONSCARE HQ

**Date** : 2026-03-21
**Périmètre** : Authentification, autorisation, edge functions, RLS, validation, headers, CORS, rate limiting, XSS

---

## Résumé exécutif

L'architecture de sécurité repose sur 9 couches de défense en profondeur : authentification Supabase Auth (JWT), contexte session (AuthContext), gardes de route (ProtectedRoute), gardes de module (ModuleGuard), RLS PostgreSQL, validation d'autorisation dans les edge functions, validation d'entrée (Zod), sanitisation XSS, et rate limiting.

**Vulnérabilités corrigées** : 10 (6 critiques/hautes + 4 recommandations implémentées)
**Vulnérabilités résiduelles** : 0 bloquante, 2 notes informatives

---

## Vulnérabilités corrigées — Round 1 (critiques)

### 1. CRITIQUE — hq-chat : absence totale d'authentification

**Fichier** : `supabase/functions/hq-chat/index.ts`
**Risque** : N'importe quel utilisateur internet pouvait appeler l'endpoint et consommer les crédits IA (LOVABLE_API_KEY) sans authentification.
**Correction** : Ajout de la validation Bearer token + JWT claims + vérification du rôle `owner` via RPC `has_role()`, aligné sur le pattern des autres edge functions.

### 2. CRITIQUE — hq-chat : absence de validation des entrées

**Fichier** : `supabase/functions/hq-chat/index.ts`
**Risque** : Le tableau `messages` était accepté sans limite de taille, nombre, ou validation de contenu. Risque d'exhaustion de tokens IA et de DoS.
**Correction** : Ajout de limites strictes :
- Max 50 messages par requête
- Max 8 000 caractères par message
- Max 100 000 caractères au total
- Validation du type et du rôle de chaque message (`user`, `assistant`, `system`)

### 3. HAUTE — hq-chat : fuite d'erreurs internes

**Fichier** : `supabase/functions/hq-chat/index.ts`
**Risque** : Les messages d'erreur internes (e.message) étaient renvoyés au client, pouvant exposer des détails d'implémentation.
**Correction** : Remplacement par des messages génériques ("Service temporairement indisponible").

### 4. HAUTE — send-push-notification : attaque par timing

**Fichier** : `supabase/functions/send-push-notification/index.ts`
**Risque** : La comparaison `cronSecret !== expectedSecret` utilisait une comparaison directe de chaînes, vulnérable aux attaques par timing.
**Correction** : Utilisation de `timingSafeEqual` de la bibliothèque standard Deno pour une comparaison en temps constant.

### 5. HAUTE — Absence de Content Security Policy (CSP)

**Fichier** : `index.html`
**Risque** : Sans CSP, le site était vulnérable aux attaques XSS par injection de scripts tiers, au clickjacking, et à l'exfiltration de données.
**Correction** : Ajout des meta tags de sécurité :
- `Content-Security-Policy` : restreint les sources de scripts, styles, connexions, images
- `X-Content-Type-Options: nosniff` : empêche le MIME sniffing
- `X-Frame-Options: DENY` : bloque l'intégration en iframe
- `Referrer-Policy: strict-origin-when-cross-origin`

### 6. MOYENNE — send-push-notification : absence de validation des entrées

**Fichier** : `supabase/functions/send-push-notification/index.ts`
**Risque** : Les paramètres `title`, `message`, `urgency`, `url` n'étaient pas validés, permettant des payloads arbitrairement longs.
**Correction** : Ajout de validation stricte dans `handleSendPush()` :
- `title` : requis, max 200 caractères
- `message` : requis, max 2000 caractères
- `urgency` : enum validé (low, medium, high, critical)
- `url` : max 500 caractères

---

## Recommandations implémentées — Round 2

### R1. CORS centralisé et configurable (17 edge functions)

**Impact** : Moyen → Corrigé
**Fichiers** : `supabase/functions/_shared/cors.ts` + 17 edge functions
**Avant** : Chaque fonction définissait `"Access-Control-Allow-Origin": "*"` localement, sans possibilité de restriction.
**Après** : Module partagé `_shared/cors.ts` avec :
- Variable d'environnement `ALLOWED_ORIGIN` pour restreindre en production
- Support multi-origines (séparées par virgule) avec validation de l'en-tête `Origin`
- Fallback `*` pour le développement local
- Ajout de `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- Code dédupliqué : 1 définition au lieu de 17

### R2. Rate limiting serveur sur les edge functions coûteuses

**Impact** : Moyen → Corrigé
**Fichiers** : `supabase/functions/_shared/rate-limit.ts` + 5 edge functions
**Avant** : Seul `contact-form` avait un rate limiting serveur. Les fonctions coûteuses (IA, scraping) n'avaient aucune limite.
**Après** : Module partagé `_shared/rate-limit.ts` avec :
- Store en mémoire par isolat Deno avec nettoyage automatique
- Configuration par fonction (maxRequests, windowMs)
- Réponse 429 avec en-tête `Retry-After`

Limites appliquées :

| Fonction | Limite | Fenêtre | Raison |
|----------|--------|---------|--------|
| `hq-chat` | 30 req | 5 min | Crédits IA (Lovable gateway) |
| `executive-run` | 30 req | 5 min | Crédits IA (multiples modèles) |
| `intelligence-search` | 20 req | 5 min | Quota Perplexity API |
| `web-scraper` | 15 req | 5 min | Quota Firecrawl API |
| `platform-analysis` | 10 req | 5 min | Analyse lourde + crédits IA |

### R3. Suppression du .env du tracking git

**Impact** : Faible → Corrigé
**Fichiers** : `.gitignore`, `.env`
**Avant** : Le fichier `.env` (contenant les clés Supabase publiques) était suivi par git et commité dans l'historique.
**Après** :
- `.env` ajouté au `.gitignore` (+ `.env.local`, `.env.production`, `.env.staging`)
- `.env` retiré du tracking git via `git rm --cached`
- Les clés exposées sont des clés anon/publishable (protégées par RLS), risque limité
- **Note** : Les clés restent dans l'historique git. En cas de doute, rotation recommandée via le dashboard Supabase.

### R4. Couverture XSS — Audit complet

**Impact** : Faible → Vérifié (aucun correctif nécessaire)
**Résultat de l'audit** :
- `sanitizeHtml()` est utilisé systématiquement sur le formulaire de contact (ContactPage.tsx)
- Un seul `dangerouslySetInnerHTML` trouvé (chart.tsx, CSS variables internes — sûr)
- Les paramètres URL sont validés contre des whitelists (PlateformesPage, HQPlateformesPage)
- React assure l'échappement automatique du contenu texte dans le JSX
- **Conclusion** : Aucune vulnérabilité XSS détectée

---

## Modules partagés créés

### `supabase/functions/_shared/cors.ts`
Configuration CORS centralisée et configurable par variable d'environnement.

### `supabase/functions/_shared/auth.ts`
Helper d'authentification réutilisable avec :
- `validateAuth(req, role?)` : valide le Bearer token, extrait les claims, vérifie le rôle
- `isAuthError(result)` : type guard pour distinguer AuthResult d'AuthError
- `authErrorResponse(error, cors)` : construit la réponse HTTP d'erreur

### `supabase/functions/_shared/rate-limit.ts`
Rate limiting serveur par isolat Deno avec :
- `checkRateLimit(key, config)` : vérifie les limites par clé unique
- `rateLimitResponse(result, cors)` : construit la réponse 429 avec Retry-After
- Nettoyage automatique des entrées expirées

---

## Architecture de sécurité — Vue d'ensemble finale

```
Utilisateur
  │
  ├─ [1] Authentification (Supabase Auth / JWT + auto-refresh)
  ├─ [2] Contexte session (AuthContext + useAuth hook)
  ├─ [3] Garde de route (ProtectedRoute → /hq/*)
  ├─ [4] Garde de module (ModuleGuard → permissions RBAC)
  ├─ [5] Validation d'entrée (Zod schemas + sanitizeHtml)
  ├─ [6] Edge Functions (Bearer token + has_role RPC + rate limiting)
  ├─ [7] RLS PostgreSQL (row-level security deny-by-default)
  ├─ [8] Rate limiting (client login + serveur edge functions)
  ├─ [9] CSP + Security Headers (XSS, clickjacking, MIME, referrer)
  └─ [10] CORS centralisé (configurable par ALLOWED_ORIGIN)
```

## Notes résiduelles (informatives, non bloquantes)

1. **localStorage pour les JWT** : Standard Supabase, mitigé par CSP + sanitisation XSS. Pas de modification nécessaire.
2. **Clés anon dans l'historique git** : Clés publiques protégées par RLS. Rotation recommandée si le repo devient public.

---

## Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `supabase/functions/_shared/cors.ts` | Nouveau — CORS centralisé configurable |
| `supabase/functions/_shared/auth.ts` | Nouveau — Helper d'authentification partagé |
| `supabase/functions/_shared/rate-limit.ts` | Nouveau — Rate limiting serveur |
| `supabase/functions/hq-chat/index.ts` | Auth + validation + rate limit + erreurs |
| `supabase/functions/send-push-notification/index.ts` | Timing-safe + validation + CORS partagé |
| `supabase/functions/intelligence-search/index.ts` | CORS partagé + rate limit (20/5min) |
| `supabase/functions/web-scraper/index.ts` | CORS partagé + rate limit (15/5min) |
| `supabase/functions/executive-run/index.ts` | CORS partagé + rate limit (30/5min) |
| `supabase/functions/platform-analysis/index.ts` | CORS partagé + rate limit (10/5min) |
| `supabase/functions/ai-scheduler/index.ts` | CORS partagé |
| `supabase/functions/check-api-status/index.ts` | CORS partagé |
| `supabase/functions/check-push-triggers/index.ts` | CORS partagé |
| `supabase/functions/contact-form/index.ts` | CORS partagé |
| `supabase/functions/github-sync/index.ts` | CORS partagé |
| `supabase/functions/growth-analytics/index.ts` | CORS partagé |
| `supabase/functions/journal-impact/index.ts` | CORS partagé |
| `supabase/functions/manage-users/index.ts` | CORS partagé |
| `supabase/functions/platform-monitor/index.ts` | CORS partagé |
| `supabase/functions/scheduled-runs/index.ts` | CORS partagé |
| `supabase/functions/stripe-kpis/index.ts` | CORS partagé |
| `index.html` | CSP + security headers |
| `.gitignore` | Protection .env |
