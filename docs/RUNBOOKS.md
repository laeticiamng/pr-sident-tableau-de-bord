# 📖 Runbooks d'incidents — EMOTIONSCARE HQ

> Procédures opérationnelles pour gérer les incidents critiques détectés par la page `/hq/governance`.
> Chaque runbook suit le format **Symptôme → Diagnostic → Remédiation → Validation**.

---

## 🚨 RB-001 — DLQ saturée (>20 entrées en pending)

### Symptôme
- Widget DLQ sur `/hq/diagnostics` affiche un badge `> 20 en cours`
- Alertes Realtime sur le panneau notifications

### Diagnostic (5 min)
1. Ouvrir `/hq/diagnostics` → ReliabilityWidget
2. Identifier le `run_type` récurrent (souvent un type unique = problème ciblé)
3. Vérifier le statut breaker AI Gateway via `/functions/v1/healthz`
4. Consulter `hq.structured_logs` filtré sur `source=executive-run` et `level=error` (15 dernières minutes)

### Remédiation
| Cause | Action |
|-------|--------|
| Breaker `OPEN` | Attendre 60s (auto-reset). Si persiste → vérifier quota Lovable AI |
| Erreur 429 (rate limit) | Réduire fréquence Autopilot dans `/hq/settings` |
| Erreur 500 (LLM down) | Aucune action manuelle — DLQ retry exponentiel (1min/5min/30min) |
| `abandoned > 0` | Audit manuel nécessaire — bug applicatif probable |

### Validation
- Pending tombe sous 5 dans les 30 minutes
- Aucune nouvelle entrée `abandoned` créée

---

## 🔌 RB-002 — Circuit-breaker AI Gateway OPEN

### Symptôme
- `/healthz` retourne `ai_gateway_breaker.ok: false`
- Runs IA retournent un fallback message ("⚠️ Service IA temporairement indisponible")

### Diagnostic (3 min)
1. Vérifier le quota Lovable AI dans **Settings → Lovable AI**
2. Consulter `structured_logs` source `ai-gateway` sur les 15 dernières minutes
3. Identifier le code d'erreur dominant (429 = quota, 5xx = panne, autres = bug)

### Remédiation
| Cause | Action |
|-------|--------|
| Quota dépassé | Augmenter le crédit dans Lovable Cloud Settings |
| Panne LLM upstream | Aucune — le breaker se referme automatiquement après 60s sans erreur |
| Erreur applicative | Rollback du dernier déploiement edge function |

### Validation
- `/healthz` retourne `status: healthy` (200)
- Nouveau run lancé manuellement passe sans fallback

---

## 💸 RB-003 — Budget IA dépassé (>80% mensuel)

### Symptôme
- Widget AICostWidget en rouge avec alerte "seuil 80% atteint"
- Champ `is_alert_threshold_reached: true` dans `get_hq_ai_budget_status`

### Diagnostic (5 min)
1. Consulter le top-5 runs gourmands sur `/hq/governance`
2. Identifier les runs Autopilot non critiques
3. Comparer avec la projection mensuelle (`projection_eur`)

### Remédiation
| Action | Quand |
|--------|-------|
| Désactiver runs Autopilot non essentiels | Si projection > 120% du target |
| Réduire fréquence (daily → weekly) | Pour runs `*_REVIEW` et `*_REPORT` |
| Augmenter `monthly_target_eur` | Si la croissance d'usage est justifiée par le ROI |

```sql
-- Mise à jour du budget mensuel (à exécuter manuellement)
UPDATE hq.system_config
SET value = jsonb_set(value, '{monthly_target_eur}', '300')
WHERE key = 'ai_budget';
```

### Validation
- Projection mensuelle revient sous le seuil de 80%
- Audit log `config.updated` créé

---

## 🚦 RB-004 — Rate-limit IP saturé (Horizon 4)

### Symptôme
- Réponses HTTP 429 massives sur une edge function publique
- Table `public.rate_limit_buckets` avec un `bucket_key` répété (>100 entrées dans la dernière heure)

### Diagnostic
```sql
SELECT bucket_key, SUM(count) AS hits, MAX(window_start) AS last_hit
FROM public.rate_limit_buckets
WHERE window_start > now() - interval '1 hour'
GROUP BY bucket_key
ORDER BY hits DESC LIMIT 20;
```

### Remédiation
| Cause | Action |
|-------|--------|
| Bot/scraper malveillant | Bloquer l'IP au niveau Cloudflare/WAF |
| Pic légitime (campagne) | Augmenter temporairement `p_max_requests` dans le code de la fonction |
| Faux positif (NAT entreprise) | Étendre la fenêtre `p_window_seconds` à 3600s |

### Validation
- Aucun nouveau bucket créé pour la `bucket_key` incriminée
- Logs structured_logs `source=rate-limit` retournent à la normale

---

## 🏢 RB-005 — Déplacer une organisation (Horizon 4 / préparation H5)

### Contexte
Les tables `organizations` et `organization_members` sont en place mais non utilisées en production (mode hybride). Toutes les RPCs HQ utilisent encore `is_owner()`.

### Quand activer ?
- Quand un 2ème owner est ajouté ET nécessite une isolation de données
- Avant la commercialisation multi-clients

### Procédure (à exécuter en H5)
1. Backfill `organization_id` sur toutes les tables HQ avec l'org par défaut
2. Migrer chaque RPC HQ pour ajouter le filtre `organization_id = current_user_org_id()`
3. Renforcer les RLS : remplacer `is_owner()` par `has_org_access(auth.uid(), organization_id)`
4. Tests E2E complets sur 2 organisations distinctes

---

## 🔧 RB-006 — Migration extensions Postgres (Horizon 4)

### État actuel (post-H4)
| Extension | Schéma | Migrable ? |
|-----------|--------|------------|
| `pgcrypto` | `extensions` | ✅ Migré |
| `pg_cron` | `cron` (natif) | ❌ Bloqué Supabase |
| `pg_net` | `net` (natif) | ❌ Bloqué Supabase |
| `pg_graphql` | `graphql` | ❌ Bloqué Supabase |

### Pourquoi pg_cron / pg_net ne sont pas dans `extensions` ?
- Supabase ne supporte pas leur déplacement (jobs actifs + dépendances internes)
- Le warning du linter est **info-only** : aucun impact sécurité réel
- Documenté ici pour traçabilité audit Big4

### Si rollback nécessaire
```sql
ALTER EXTENSION pgcrypto SET SCHEMA public;
```

---

## 📚 Maintenance des runbooks

- Ajouter un nouveau runbook : créer une section `## 🆕 RB-XXX` ici, puis ajouter l'entrée dans `get_hq_governance_dashboard()` (champ `runbooks`).
- Tester chaque procédure trimestriellement (game day).
- Mesurer le MTTR cible : **< 15 min** pour les RB-001/002/004, **< 60 min** pour RB-003.

---

## 🛡️ RB-007 — Audit sécurité 2026-04 (P0/P1 résolus)

### Vulnérabilités corrigées (migration `20260417_audit_p0_p1`)

| ID | Sévérité | Problème | Correctif |
|----|----------|----------|-----------|
| REALTIME_DATA_LEAK | P0 | `contact_messages` (PII) diffusé via Realtime à tout authentifié | Table retirée de `supabase_realtime` |
| MISSING_INSERT_POLICY | P0 | `contact_messages` sans policy INSERT explicite | Policy `Deny client inserts` (anon+authenticated → false) — seul service_role insère via edge `contact-form` |
| MISSING_RLS_PROTECTION | P1 | `has_org_access(_user_id, _org_id)` permettait sondage croisé | Fonction réécrite : ignore le paramètre, utilise `auth.uid()` |
| ANALYTICS_OPEN_INSERT | P1 | `analytics_events` acceptait n'importe quel payload anon | Policy avec validation longueur des champs |

### Validation
- `SELECT * FROM pg_publication_tables WHERE tablename='contact_messages';` → 0 ligne
- `SELECT pg_get_function_result('public.has_org_access(uuid,uuid)'::regprocedure);` → STABLE
- Test : envoi d'un message via `/contact` → entry visible dans `/hq/messages`
