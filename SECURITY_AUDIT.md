# Audit Technique Sécurité — EMOTIONSCARE HQ

**Date** : 2026-03-21
**Périmètre** : Authentification, autorisation, edge functions, RLS, validation, headers

---

## Résumé exécutif

L'architecture de sécurité repose sur 9 couches de défense en profondeur : authentification Supabase Auth (JWT), contexte session (AuthContext), gardes de route (ProtectedRoute), gardes de module (ModuleGuard), RLS PostgreSQL, validation d'autorisation dans les edge functions, validation d'entrée (Zod), sanitisation XSS, et rate limiting.

**Vulnérabilités corrigées dans ce commit** : 6
**Vulnérabilités restantes (recommandations)** : 4

---

## Vulnérabilités corrigées

### 1. CRITIQUE — hq-chat : absence totale d'authentification

**Fichier** : `supabase/functions/hq-chat/index.ts`
**Risque** : N'importe quel utilisateur internet pouvait appeler l'endpoint et consommer les crédits IA (LOVABLE_API_KEY) sans authentification.
**Correction** : Ajout de la validation Bearer token + JWT claims + vérification du rôle `owner` via RPC `has_role()`, aligné sur le pattern des autres edge functions (executive-run, intelligence-search, etc.).

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
**Risque** : La comparaison `cronSecret !== expectedSecret` (ligne 171) utilisait une comparaison directe de chaînes, vulnérable aux attaques par timing pour deviner le secret caractère par caractère.
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

## Recommandations restantes (non bloquantes)

### R1. CORS wildcard (`Access-Control-Allow-Origin: *`)

**Impact** : Moyen
**Fichiers** : Tous les 17 edge functions
**Contexte** : Standard Supabase, mitigé par l'authentification JWT sur la plupart des endpoints. La seule exception est `contact-form` (intentionnellement public) et le GET de `send-push-notification` (clé publique VAPID).
**Recommandation** : Restreindre l'origine au domaine de production quand possible.

### R2. Rate limiting côté serveur incomplet

**Impact** : Moyen
**Contexte** : `contact-form` implémente un rate limiting serveur exemplaire. Le login a un rate limiting côté client (5 tentatives / 60s). Les autres edge functions n'ont pas de rate limiting.
**Recommandation** : Implémenter un rate limiting par user_id sur les edge functions coûteuses (intelligence-search, executive-run, hq-chat).

### R3. Secrets Supabase dans l'historique git

**Impact** : Faible (clés anon/publishable uniquement — protégées par RLS)
**Contexte** : Le fichier `.env` contenant les clés Supabase publiques a été commité dans l'historique git. Ces clés sont conçues pour être publiques et protégées par RLS, donc le risque est limité.
**Correction partielle** : `.env` ajouté au `.gitignore` pour empêcher les futurs commits.
**Recommandation** : Considérer la rotation des clés et l'utilisation de variables d'environnement CI/CD.

### R4. localStorage pour les tokens de session

**Impact** : Faible (standard Supabase)
**Contexte** : Supabase Auth stocke les JWT dans localStorage par défaut. Vulnérable aux attaques XSS, mais mitigé par la CSP ajoutée et la sanitisation HTML existante.
**Recommandation** : Surveiller et maintenir la couverture XSS (sanitizeHtml, sanitizeForDisplay dans validation.ts).

---

## Architecture de sécurité — Vue d'ensemble

```
Utilisateur
  │
  ├─ [1] Authentification (Supabase Auth / JWT)
  ├─ [2] Contexte session (AuthContext + useAuth hook)
  ├─ [3] Garde de route (ProtectedRoute → /hq/*)
  ├─ [4] Garde de module (ModuleGuard → permissions RBAC)
  ├─ [5] Validation d'entrée (Zod schemas + sanitizeHtml)
  ├─ [6] Edge Functions (Bearer token + has_role RPC)
  ├─ [7] RLS PostgreSQL (row-level security deny-by-default)
  ├─ [8] Rate limiting (client + serveur contact-form)
  └─ [9] CSP + Security Headers (XSS, clickjacking, MIME)
```

## Fichiers clés modifiés

| Fichier | Changement |
|---------|-----------|
| `supabase/functions/hq-chat/index.ts` | Auth + validation + erreurs |
| `supabase/functions/send-push-notification/index.ts` | Timing-safe + validation |
| `index.html` | CSP + security headers |
| `.gitignore` | Protection .env |
