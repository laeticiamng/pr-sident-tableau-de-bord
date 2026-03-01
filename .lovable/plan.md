

# Audit GEO & SEO Complet — EMOTIONSCARE HQ

## Etat actuel

### Ce qui fonctionne bien
- Schema Organization statique dans `index.html` avec SIREN, TVA, fondatrice, adresse -- visible par tous les crawlers sans JS
- Schemas dynamiques GEO injectes via `usePageMeta` sur 4 pages : `/` (Organization+FAQ), `/plateformes` (ItemList+SoftwareApplication x7), `/vision` (AboutPage), `/trust` (WebPage securite)
- `robots.txt` bien configure : bloque `/hq/`, `/dashboard/`, `/auth` pour tous les bots
- `sitemap.xml` reference les 6 pages publiques, 7 plateformes externes, 4 pages legales

### Problemes identifies

#### 1. CRITIQUE : Schemas dynamiques invisibles pour les crawlers IA
Les schemas FAQPage, ItemList, SoftwareApplication, AboutPage et WebPage sont injectes via React (`usePageMeta`). Les crawlers IA (GPTBot, ClaudeBot, PerplexityBot) ne executent PAS le JavaScript -- ils ne voient que le HTML brut de `index.html`. Seul le schema Organization statique est visible.

**Impact** : 80% des schemas GEO sont invisibles pour les moteurs generatifs.

#### 2. IMPORTANT : Meta OG/Twitter incomplets
- `og:url` manquant dans `index.html`
- `og:locale` manquant (devrait etre `fr_FR`)
- `og:site_name` manquant
- `twitter:title` et `twitter:description` manquants
- Les images OG pointent vers `lovable.dev` au lieu d'une image brandee EMOTIONSCARE

#### 3. IMPORTANT : Sitemap contient des URLs externes
Le sitemap reference 7 URLs de domaines externes (`emotionscare.com`, `medmng.com`, etc.). Un sitemap ne devrait lister que les URLs du meme domaine. Google ignore ces entrees et ca peut nuire a la credibilite du sitemap.

#### 4. MOYEN : Pages sans `usePageMeta`
Les 4 pages legales (`MentionsLegalesPage`, `ConfidentialitePage`, `CGVPage`, `RGPDRegistryPage`) n'utilisent pas `usePageMeta` -- pas de title dynamique, pas de meta description, pas de `noindex`.

#### 5. MOYEN : Crawlers IA non geres dans robots.txt
Aucune directive pour `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Applebot-Extended`. Ils devraient etre autorises sur les pages publiques et bloques sur `/hq/`.

#### 6. MINEUR : Pas de `<link rel="canonical">` statique dans `index.html`
Le hook `usePageMeta` injecte un canonical dynamiquement mais il est invisible pour les crawlers sans JS.

---

## Plan de correction

### Fichier 1 : `index.html` -- Schemas statiques + meta enrichis

**Ajouts dans `<head>` :**
- Meta OG complets : `og:url`, `og:locale`, `og:site_name`
- Meta Twitter complets : `twitter:title`, `twitter:description`
- `<link rel="canonical">`
- Injecter en statique les schemas les plus importants pour le GEO :
  - `FAQPage` (5 questions/reponses)
  - `ItemList` des 7 plateformes
  - `WebSite` avec `SearchAction` potentiel

Cela garantit que **tous les crawlers** (JS ou non) voient les donnees structurees critiques.

### Fichier 2 : `public/sitemap.xml` -- Nettoyage

- Retirer les 7 URLs de domaines externes (invalides dans un sitemap mono-domaine)
- Ajouter un commentaire expliquant que les plateformes sont referencees via les schemas JSON-LD

### Fichier 3 : `public/robots.txt` -- Directives IA

Ajouter des directives specifiques :
```text
User-agent: GPTBot
Allow: /
Disallow: /hq/
Disallow: /auth

User-agent: ClaudeBot
Allow: /
Disallow: /hq/
Disallow: /auth

User-agent: PerplexityBot
Allow: /
Disallow: /hq/
Disallow: /auth

User-agent: Applebot-Extended
Allow: /
Disallow: /hq/
Disallow: /auth
```

### Fichier 4 : Pages legales -- Ajout `usePageMeta`

Ajouter `usePageMeta` avec `noindex: true` aux 4 pages legales pour :
- Eviter l'indexation de contenu boilerplate juridique
- Definir des titles/descriptions propres

Pages concernees :
- `MentionsLegalesPage.tsx`
- `ConfidentialitePage.tsx`
- `CGVPage.tsx`
- `RGPDRegistryPage.tsx`

### Fichier 5 : `src/lib/geo-schemas.ts` -- Schema WebSite

Ajouter un schema `WebSite` avec le nom du site et l'URL, a injecter en statique dans `index.html`.

---

## Resume des corrections

| Probleme | Severite | Fichier(s) | Action |
|---|---|---|---|
| Schemas invisibles sans JS | Critique | `index.html` | Dupliquer FAQ + ItemList en statique |
| Meta OG/Twitter incomplets | Important | `index.html` | Ajouter og:url, og:locale, twitter:title |
| URLs externes dans sitemap | Important | `sitemap.xml` | Retirer les 7 URLs externes |
| Pages legales sans meta | Moyen | 4 pages legales | Ajouter usePageMeta + noindex |
| Crawlers IA non geres | Moyen | `robots.txt` | Ajouter GPTBot, ClaudeBot, etc. |
| Pas de canonical statique | Mineur | `index.html` | Ajouter link rel=canonical |

## Fichiers modifies

- `index.html` -- schemas statiques + meta OG/Twitter + canonical
- `public/sitemap.xml` -- retrait URLs externes
- `public/robots.txt` -- directives crawlers IA
- `src/pages/legal/MentionsLegalesPage.tsx` -- usePageMeta + noindex
- `src/pages/legal/ConfidentialitePage.tsx` -- usePageMeta + noindex
- `src/pages/legal/CGVPage.tsx` -- usePageMeta + noindex
- `src/pages/legal/RGPDRegistryPage.tsx` -- usePageMeta + noindex
- `src/lib/geo-schemas.ts` -- ajout schema WebSite

