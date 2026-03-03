

## Analyse — État actuel vs 8 tickets

Après inspection complète, **la quasi-totalité est déjà implémentée**. Voici le bilan ticket par ticket :

| Ticket | Statut | Action restante |
|---|---|---|
| T1 — Publish + validation OG | QA manuelle | Publier puis tester opengraph.xyz (pas de code) |
| T2 — OG image pixel-perfect | Partiel | Régénérer l'image avec un prompt plus précis |
| T3 — og:image absolu + width/height/type | **Fait** | Déjà en place dans `index.html` (L19-22) et dans le hook |
| T4 — OG par page premium | **Fait** | Toutes les pages ont titre/description uniques via `usePageMeta` |
| T5 — og:image:alt + twitter:image:alt | **Quasi fait** | `index.html` + hook OK. Manque `ogImageAlt` sur `HomePage.tsx` |
| T6 — view-source JSON-LD | QA manuelle | 7 blocs statiques présents dans `index.html` (L37-360) |
| T7 — Rich Results | QA manuelle | Tester après publish |
| T8 — Playbook QA | **Fait** | `docs/QA_PUBLISH_SEO_OG.md` complet et à jour |

---

### Changements code restants (minimes)

**1. `src/pages/HomePage.tsx` (ligne 87-92)**
Ajouter `ogImageAlt` au `usePageMeta` pour cohérence avec les autres pages :
```ts
ogImageAlt: "EMOTIONSCARE — Siège social numérique, éditeur de 7 plateformes SaaS françaises"
```

**2. `public/og-image.png`**
Régénérer avec un prompt plus strict pour obtenir le texte complet "EMOTIONSCARE" + "Éditeur de logiciels SaaS — 7 plateformes innovantes" sans artefacts. Si la qualité IA reste insuffisante, recommander un upload manuel Canva/Figma.

---

### QA post-publish (T1, T6, T7)

Ces 3 tickets sont des validations manuelles. Après publish :
1. Tester les 3 URLs sur opengraph.xyz
2. `view-source` pour compter les 7 `application/ld+json`
3. Google Rich Results Test pour FAQPage

Le playbook `docs/QA_PUBLISH_SEO_OG.md` documente déjà cette procédure.

