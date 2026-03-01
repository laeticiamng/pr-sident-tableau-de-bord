

# Renforcement GEO : Schemas statiques pour /vision et /trust

## Contexte

Les schemas `AboutPage` (vision) et `WebPage` (trust) sont deja injectes dynamiquement via `usePageMeta`, mais comme identifie dans l'audit, **les crawlers IA ne executent pas le JavaScript** — ces schemas sont donc invisibles pour GPTBot, ClaudeBot et PerplexityBot.

De plus, les schemas actuels peuvent etre enrichis avec des signaux GEO supplementaires.

## Modifications

### 1. Enrichir les schemas dans `geo-schemas.ts`

**Vision (AboutPage)** — ajouter :
- `datePublished` et `dateModified` pour la fraicheur du contenu
- `hasPart` referencant les sections cles (Valeurs, Mission, Histoire)
- `award` ou `certification` si applicable

**Trust (WebPage)** — ajouter :
- `reviewedBy` avec reference a l'Organization
- `keywords` pour le signal thematique
- `isPartOf` avec reference au WebSite
- `breadcrumb` BreadcrumbList pour la navigation

### 2. Injecter en statique dans `index.html`

Ajouter 2 nouveaux blocs `<script type="application/ld+json">` dans le `<head>` de `index.html` :

**Schema AboutPage (vision)** :
- Type: AboutPage
- URL, description, mainEntity (Organization avec @id cross-reference)
- Slogan, knowsAbout, ethicsPolicy
- hasPart avec les 3 sections cles

**Schema WebPage securite (trust)** :
- Type: WebPage
- specialty: "Cybersecurite et protection des donnees"
- significantLink vers les pages legales et status
- mentions des technologies (RGPD, OWASP, RLS, AES-256, TLS 1.3, SOC 2)
- reviewedBy avec reference Organization

### 3. Conserver les schemas dynamiques

Les schemas dynamiques dans les pages React restent en place — ils servent pour les crawlers qui executent le JS (Googlebot, Bingbot). La duplication statique/dynamique est une bonne pratique GEO.

## Fichiers modifies

- `index.html` — 2 nouveaux blocs JSON-LD statiques (AboutPage + WebPage securite)
- `src/lib/geo-schemas.ts` — enrichissement des fonctions `buildVisionPageSchema()` et `buildTrustPageSchema()` avec signaux supplementaires

## Impact attendu

Les crawlers IA verront desormais **6 schemas statiques** dans `index.html` :
1. Organization (existant)
2. WebSite (existant)
3. FAQPage (existant)
4. ItemList des 7 plateformes (existant)
5. **AboutPage vision** (nouveau)
6. **WebPage securite/confiance** (nouveau)

Cela couvre 100% des pages publiques strategiques avec des donnees structurees visibles sans JavaScript.

