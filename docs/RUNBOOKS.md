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

## 📚 Maintenance des runbooks

- Ajouter un nouveau runbook : créer une section `## 🆕 RB-XXX` ici, puis ajouter l'entrée dans `get_hq_governance_dashboard()` (champ `runbooks`).
- Tester chaque procédure trimestriellement (game day).
- Mesurer le MTTR cible : **< 15 min** pour les RB-001/002, **< 60 min** pour RB-003.
