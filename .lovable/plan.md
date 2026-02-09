

# Mise a jour du nombre de plateformes : 5 → 7

L'ecosysteme compte desormais **7 plateformes** (ajout d'UrgenceOS et Track Triumph), mais le chiffre "5" est encore en dur dans **14 fichiers**. Voici toutes les corrections necessaires.

---

## Fichiers Frontend (8 fichiers)

| Fichier | Ligne | Avant | Apres |
|---------|-------|-------|-------|
| `src/components/hq/entreprise/CompanyKPIs.tsx` | 19 | `platforms: 5` | `platforms: 7` |
| `src/components/hq/cockpit/KeyMetricsGrid.tsx` | 23 | `platforms?.length \|\| 5` | `platforms?.length \|\| 7` |
| `src/pages/hq/BriefingRoom.tsx` | 54 | `platforms?.length \|\| 5` | `platforms?.length \|\| 7` |
| `src/pages/hq/HQPlateformesPage.tsx` | 101 | `"Supervision des 5 plateformes"` | `"Supervision des 7 plateformes"` |
| `src/components/hq/ExecutiveCockpit.tsx` | 139 | `"des 5 plateformes"` | `"des 7 plateformes"` |
| `src/components/hq/ExecutiveCockpit.tsx` | 313 | `"des 5 plateformes"` | `"des 7 plateformes"` |
| `src/components/hq/EssentialCockpit.tsx` | 61 | `"vos 5 plateformes"` | `"vos 7 plateformes"` |
| `src/components/hq/platforms/MultiPlatformUptimeChart.tsx` | 72 | `"des 5 plateformes"` | `"des 7 plateformes"` |
| `src/components/hq/marketing/ContentCalendar.tsx` | 13 | `"les 5 plateformes"` | `"les 7 plateformes"` |
| `src/components/hq/marketing/PlatformTrafficWidget.tsx` | 29 | `"des 5 plateformes"` | `"des 7 plateformes"` |
| `src/components/hq/support/TicketsByPriority.tsx` | 52 | `"les 5 plateformes"` | `"les 7 plateformes"` |
| `src/pages/hq/CockpitPage.tsx` | 42 | `"des 5 plateformes"` | `"des 7 plateformes"` |
| `src/pages/hq/FinancePage.tsx` | 88 | `"des 5 plateformes"` | `"des 7 plateformes"` |
| `src/pages/hq/FinancePage.tsx` | 270 | `"des 5 plateformes"` | `"des 7 plateformes"` |
| `src/hooks/usePlatformMonitor.ts` | 105 | `platforms_total \|\| 5` | `platforms_total \|\| 7` |

## Edge Functions (3 fichiers) — registres de plateformes incomplets

| Fichier | Correction |
|---------|------------|
| `supabase/functions/executive-run/index.ts` | Ajouter UrgenceOS + Track Triumph dans `MANAGED_REPOS`, mettre a jour le commentaire "5 → 7", corriger `pixel-perfect-replica` → `nearvity`, et mettre a jour le prompt (ligne 410) avec les 7 noms |
| `supabase/functions/github-sync/index.ts` | Ajouter UrgenceOS + Track Triumph dans `MANAGED_REPOS`, corriger `pixel-perfect-replica` → `nearvity`, commentaire "5 → 7" |
| `supabase/functions/platform-monitor/index.ts` | Ajouter les URLs UrgenceOS + Track Triumph dans `PLATFORM_ENDPOINTS`, corriger la cle `pixel-perfect-replica` → `nearvity`, commentaire "5 → 7" |

## Agent Profiles (1 fichier)

| Fichier | Correction |
|---------|------------|
| `src/lib/agent-profiles.ts` | Remplacer toutes les occurrences de "5 plateformes" par "7 plateformes" dans les commentaires et les `systemPrompt` des agents |

## Test (1 fichier)

| Fichier | Correction |
|---------|------------|
| `src/test/components/ExecutiveCockpit.test.tsx` | `totalPlatforms: 5` → `totalPlatforms: 7` |

---

## Risque
Faible — modifications de textes, valeurs par defaut et registres statiques uniquement. Les edge functions seront redeployees automatiquement.

