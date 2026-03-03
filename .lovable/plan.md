

## Plan d'implémentation — 8 tickets SEO/OG (P0–P2)

Ce plan couvre les 8 tickets en les regroupant par impact et dépendances. Voici l'état actuel et les actions requises.

---

### Analyse de l'existant

- **`usePageMeta` hook** : déjà en place avec support `og:title`, `og:description`, `og:url`, `og:image`, `twitter:*` (ajouté dans le dernier diff). Toutes les pages publiques l'utilisent déjà.
- **`index.html`** : contient les OG/Twitter tags statiques globaux + 7 blocs JSON-LD statiques (Organization, WebSite, FAQPage, ItemList, AboutPage, WebPage trust, BreadcrumbList).
- **Pas de composant `SEOHead.tsx`** : tout passe par le hook `usePageMeta` + injection statique dans `index.html`.
- **Pages publiques** : `/plateformes`, `/vision`, `/trust`, `/contact`, `/status` utilisent déjà `usePageMeta` avec titre et description uniques, mais **sans `ogImage` personnalisé** et sans `og:image:alt`.

---

### Ticket 1 — OG image brandée définitive (P0)

**Approche** : Générer une image OG via l'API Lovable AI (modèle `google/gemini-3-pro-image-preview`) avec un prompt très précis pour obtenir logo + "EMOTIONSCARE" + slogan. Sauvegarder en `public/og-image.png` (1200×630, < 300 KB).

**Risque** : La génération IA peut ne pas produire un texte parfait. Alternative : créer une image SVG/HTML convertie en PNG via un edge function, ou fournir un fichier uploadé manuellement.

**Action** : Remplacer `public/og-image.png`. Aucun changement de code nécessaire (les refs sont déjà correctes).

---

### Ticket 2 — OG tags uniques par page (P0)

**État actuel** : Les pages `/plateformes`, `/vision`, `/trust` passent déjà `title` et `description` à `usePageMeta`, qui injecte dynamiquement les OG/Twitter tags. **C'est déjà fonctionnel** grâce au dernier diff.

**Problème SPA** : Les crawlers sociaux (LinkedIn, Twitter) ne exécutent pas le JS. Les tags dynamiques ne seront **pas visibles** dans `view-source`. Seuls les tags statiques de `index.html` seront vus.

**Options** :
1. **Accepter la limitation SPA** — les crawlers modernes (Facebook, Twitter) exécutent un renderer JS. LinkedIn aussi dans la plupart des cas.
2. **Dupliquer dans index.html** — impossible car une seule page HTML pour toutes les routes.
3. **Pré-rendering / SSR** — hors scope (Vite SPA).

**Action recommandée** : Vérifier que le hook fonctionne correctement (il le fait déjà). Documenter la limitation SPA dans le playbook QA. Pour un rendu OG parfait sans JS, il faudrait un service de pré-rendering (type prerender.io) — hors scope actuel.

---

### Ticket 3 — Cohérence image OG vs screenshot auto (P1)

**Action** :
- Vérifier que `index.html` contient bien `og:image` avec URL absolue (déjà le cas : `https://president-cockpit-hq.lovable.app/og-image.png`).
- Après publish, tester sur opengraph.xyz. Si screenshot persiste = cache CDN, attendre ou forcer le refresh du validateur.
- Aucun changement de code nécessaire — l'URL absolue est déjà en place dans `index.html` et dans le hook.

---

### Ticket 4 — Balises OG avancées : `og:image:alt`, canonical, robots (P2)

**Changements requis** :
1. **`index.html`** : Ajouter `og:image:alt` statique (ex: "EMOTIONSCARE — Éditeur de 7 plateformes SaaS françaises").
2. **`usePageMeta` hook** : Ajouter support pour `ogImageAlt` dans les options. Injecter `og:image:alt` et `twitter:image:alt` dynamiquement.
3. Les canonical et robots sont **déjà gérés** par le hook (`canonicalPath`, `noindex`). Pages HQ utilisent déjà `noindex: true`.

---

### Ticket 5 — Vérification JSON-LD en prod (P1)

**État actuel** : Les 7 JSON-LD sont injectés **statiquement** dans `index.html` → ils seront visibles dans `view-source` sans JS. Les JSON-LD dynamiques (via `usePageMeta` + `jsonLd`) ne seront visibles qu'après exécution JS.

**Action** : Aucun changement de code. C'est une tâche de QA manuelle post-publish. À documenter dans le playbook (Ticket 8).

---

### Ticket 6 — QA Rich Results (P1)

**Action** : Tâche de QA manuelle. Tester sur [Google Rich Results Test](https://search.google.com/test/rich-results) après publish. Les JSON-LD FAQPage sont déjà dans `index.html` statiquement. Aucun changement de code attendu sauf si des erreurs JSON sont détectées.

---

### Ticket 7 — OG perf/compat : width/height/type (P2)

**État actuel** : `index.html` contient déjà `og:image:width=1200`, `og:image:height=630`, `og:image:type=image/png`.

**Action** : Optionnellement ajouter un `<link rel="preload" as="image" href="/og-image.png">` dans `index.html` pour accélérer le chargement. Minimal.

---

### Ticket 8 — Playbook QA doc (P2)

**Action** : Créer `docs/QA_PUBLISH_SEO_OG.md` avec la checklist complète. Ajouter un lien dans `README.md`.

---

### Résumé des changements code à effectuer

| Fichier | Changement |
|---|---|
| `public/og-image.png` | Remplacer par image brandée définitive |
| `src/hooks/usePageMeta.ts` | Ajouter `ogImageAlt` option → inject `og:image:alt` + `twitter:image:alt` |
| `index.html` | Ajouter `og:image:alt`, optionnel `<link rel="preload">` pour OG image |
| `docs/QA_PUBLISH_SEO_OG.md` | Nouveau fichier — playbook QA publish/SEO/OG |
| `README.md` | Ajouter lien vers le playbook |

Les tickets 3, 5, 6 sont des tâches QA manuelles post-publish sans changement de code.
Le ticket 2 est **déjà implémenté** par le hook `usePageMeta` (limitation SPA documentée).

