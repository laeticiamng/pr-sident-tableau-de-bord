
# Fix: Edge Function executive-run 500 Error (`.catch()` incompatibility)

## Problem

Launching any run from the monitoring dashboard returns **HTTP 500** with:
```
TypeError: supabaseAdmin.rpc(...).catch is not a function
```

The Supabase JS v2 `.rpc()` method returns a `PostgrestFilterBuilder` (a thenable, not a full Promise). Calling `.catch()` directly on it fails at runtime. There are **15 occurrences** of this pattern in `executive-run/index.ts`.

## Root Cause

Pattern like:
```typescript
await supabaseAdmin.rpc("insert_hq_log", { ... }).catch(() => {});
```
`PostgrestFilterBuilder` supports `.then()` but NOT `.catch()`.

## Fix

Replace all `.catch()` chains on `rpc()` calls with proper error handling using one of two patterns:

**Pattern A (best-effort logging):**
```typescript
try {
  await supabaseAdmin.rpc("insert_hq_log", { ... });
} catch (_) { /* best-effort */ }
```

**Pattern B (with error logging):**
```typescript
const { error: logErr } = await supabaseAdmin.rpc("insert_hq_log", { ... });
if (logErr) console.error("[Executive Run] Log insert error:", logErr.message);
```

## Files to Modify

- `supabase/functions/executive-run/index.ts` -- Replace all 15 `.catch()` occurrences on `rpc()` calls with try/catch or Supabase error destructuring

## Impact

- All 6 run launch buttons will work again
- Logging (run.started, run.completed, run.failed) will function correctly
- No other files need changes -- the fix is isolated to the edge function

## Verification

After fix, re-launch "Revue Plateformes" from monitoring dashboard and confirm:
1. Run completes (200 OK)
2. Appears in history with status "Termine"
3. Structured logs show run.started + run.completed entries
4. Cost updates in KPI widget
