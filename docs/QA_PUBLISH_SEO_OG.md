# Playbook QA — Publish → Validate SEO/OG

Checklist à exécuter **après chaque publish** pour valider le SEO, les balises Open Graph et les données structurées.

---

## 1. Publish

1. Cliquer **Publish** dans Lovable
2. Confirmer **"Update"**
3. Attendre 1–2 minutes (propagation CDN)

---

## 2. View-Source — Pages publiques

Pour chaque URL ci-dessous, ouvrir `view-source:` dans le navigateur et vérifier :

### `/` (Accueil)
- [ ] `<title>` contient "EMOTIONSCARE"
- [ ] `<meta name="description">` présent et non vide
- [ ] `<meta property="og:title">` présent
- [ ] `<meta property="og:description">` présent
- [ ] `<meta property="og:image">` → URL absolue vers `/og-image.png`
- [ ] `<meta property="og:image:alt">` présent
- [ ] `<meta property="og:image:width">` = 1200
- [ ] `<meta property="og:image:height">` = 630
- [ ] `<meta name="twitter:card">` = `summary_large_image`
- [ ] `<meta name="twitter:image">` présent
- [ ] `<link rel="canonical">` présent
- [ ] JSON-LD `Organization` (Ctrl+F `"@type": "Organization"`)
- [ ] JSON-LD `WebSite`
- [ ] JSON-LD `FAQPage`
- [ ] JSON-LD `ItemList` (7 plateformes)
- [ ] JSON-LD `BreadcrumbList`

### `/vision`
- [ ] JSON-LD `AboutPage` présent (statique dans index.html)

### `/trust`
- [ ] JSON-LD `WebPage` sécurité présent (statique dans index.html)

### `/hq/*` (pages privées)
- [ ] **Absent** du sitemap.xml
- [ ] `robots.txt` bloque `/hq/`

---

## 3. Validateurs externes

### opengraph.xyz
1. Ouvrir https://opengraph.xyz
2. Tester les URLs :
   - `https://president-cockpit-hq.lovable.app/`
   - `https://president-cockpit-hq.lovable.app/plateformes`
   - `https://president-cockpit-hq.lovable.app/vision`
   - `https://president-cockpit-hq.lovable.app/trust`
3. Vérifier :
   - [ ] **Image OG** affichée (pas un screenshot automatique)
   - [ ] **Titre** correct
   - [ ] **Description** correcte

### LinkedIn Post Inspector
1. Ouvrir https://www.linkedin.com/post-inspector/
2. Tester l'URL d'accueil
3. Vérifier l'aperçu du lien

### Twitter Card Validator
1. Ouvrir https://cards-dev.twitter.com/validator
2. Tester l'URL d'accueil
3. Vérifier le rendu `summary_large_image`

---

## 4. Google Rich Results Test

1. Ouvrir https://search.google.com/test/rich-results
2. Tester `/` :
   - [ ] FAQPage détectée
   - [ ] Aucune erreur critique
   - [ ] Aucun avertissement bloquant
3. Tester `/plateformes` si applicable

---

## 5. Troubleshooting

### L'image OG montre un screenshot au lieu de og-image.png
- **Cause probable** : cache CDN ou site non republié
- **Solution** : Attendre 2–5 min après publish, puis re-tester. Si persiste, vérifier que `og:image` est une URL absolue (`https://...`)

### Les tags OG dynamiques n'apparaissent pas dans view-source
- **Cause** : Limitation SPA — les tags sont injectés par JavaScript via `usePageMeta`
- **Impact** : Les crawlers modernes (Facebook, Twitter, LinkedIn) exécutent le JS. Les tags statiques dans `index.html` servent de fallback.
- **Solution long-terme** : Service de pré-rendering (prerender.io) — hors scope actuel

### JSON-LD non détecté par Rich Results Test
- Vérifier la syntaxe JSON (virgules, guillemets)
- Vérifier que le `<script type="application/ld+json">` est bien dans `<head>`
- Tester avec le JSON-LD Playground : https://json-ld.org/playground/

---

## 6. Fréquence

- **À chaque release** : Étapes 1–2 (publish + view-source rapide)
- **Hebdomadaire** : Étape 3 (validateurs externes)
- **Mensuel** : Étape 4 (Rich Results Test)
