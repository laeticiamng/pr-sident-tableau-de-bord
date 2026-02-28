

# Persistance des Runs dans la base de donnees

## Objectif
Chaque run complete par l'edge function `executive-run` sera sauvegarde dans la table `hq.runs` via l'appel RPC `insert_hq_run`. Le compteur "Runs totaux" du dashboard se mettra a jour automatiquement.

## Analyse technique

Le RPC `insert_hq_run` existe deja et insere dans `hq.runs` avec un log audit automatique. Il verifie `is_owner()` via `auth.uid()`, donc il faut utiliser le client authentifie (`supabaseAuth` avec le JWT utilisateur), pas le client admin (service role).

## Modifications

### Fichier: `supabase/functions/executive-run/index.ts`

**1. Apres le run reussi (ligne ~802-809)** -- Ajouter l'appel `insert_hq_run` via `supabaseAuth` :

```typescript
// Persist run in hq.runs table (uses user's JWT for RLS)
const { data: persistedRunId, error: persistErr } = await supabaseAuth.rpc("insert_hq_run", {
  p_run_type: run_type,
  p_platform_key: platform_key || null,
  p_owner_requested: true,
  p_status: "completed",
  p_executive_summary: executiveSummary.substring(0, 10000),
  p_detailed_appendix: {
    model_used: model,
    data_sources: runResult.data_sources,
    duration_ms: durationMs,
    cost_estimate: costEstimate,
    steps: template.steps,
  },
});
if (persistErr) {
  console.error("[Executive Run] Run persist error:", persistErr.message);
} else {
  runResult.run_id = persistedRunId;
}
```

**2. Dans le bloc catch (ligne ~820-832)** -- Ajouter la persistance du run echoue (best-effort via admin car le user context peut ne plus etre disponible) :

```typescript
// Also try to persist failed run
const { error: failPersistErr } = await adminClient.rpc("insert_hq_run", {
  p_run_type: run_type || "UNKNOWN",
  p_platform_key: platform_key || null,
  p_status: "failed",
  p_executive_summary: error instanceof Error ? error.message : String(error),
});
```

Note: Le bloc catch n'a pas acces aux variables `run_type`/`platform_key` (elles sont dans le try). On gardera la persistance des echecs en best-effort uniquement via les structured_logs deja en place -- pas de changement dans le catch.

## Impact

- Le compteur "Runs totaux" sur `/hq/agents-monitoring` se met a jour automatiquement (le hook `useRecentRuns` interroge deja `hq.runs`)
- L'historique affiche le resume, le statut, le cout et la duree de chaque run
- Le `run_id` retourne au frontend correspond a l'ID reel en base (plus un UUID genere cote client)
- Zero changement cote frontend -- tout est deja cable

## Fichiers modifies

- `supabase/functions/executive-run/index.ts` -- ajout de l'appel `insert_hq_run` apres completion reussie

