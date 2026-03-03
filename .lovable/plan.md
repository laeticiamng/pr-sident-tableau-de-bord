

## Analyse des 8 tickets vs. état actuel du projet

### Tickets DÉJÀ TERMINÉS

| Ticket | Statut | Preuve |
|--------|--------|--------|
| **T3 — Hardening OG absolu + preload** | ✅ DONE | `index.html` contient déjà : URL absolue `og:image`, `og:image:width=1200`, `og:image:height=630`, `og:image:type=image/png`, `og:image:alt`, et `<link rel="preload" as="image" href="/og-image.png" />` |
| **T4 — OG premium par page** | ✅ DONE | Les 6 pages publiques utilisent déjà `usePageMeta` avec title + description uniques : `/` (HomePage), `/plateformes`, `/vision`, `/trust`, `/status`, `/contact`. Le hook gère le cleanup au démontage. |
| **T5 — JSON-LD validation stricte** | ✅ DONE | 7 blocs `application/ld+json` statiques confirmés dans `index.html` : Organization, WebSite, FAQPage, ItemList, AboutPage, WebPage (trust), BreadcrumbList. |
| **T8 — RLS immutabilité analytics_events** | ✅ DONE | Migration `20260303170814` appliquée : `CREATE POLICY "Deny all updates on analytics_events" ... USING (false)`. Confirmé par le dernier scan de sécurité. |

### Tickets RESTANTS à implémenter

| Ticket | Priorité | Action requise |
|--------|----------|----------------|
| **T1 — Publish + validation OG** | P0 | Action manuelle : cliquer Publish, puis tester sur opengraph.xyz pour `/`, `/plateformes`, `/vision`. Aucun code à modifier. |
| **T2 — OG image pixel-perfect** | P0 | En attente de l'image Canva. L'utilisateur doit la glisser dans le chat pour remplacement de `public/og-image.png`. |
| **T6 — Rich Results Test FAQPage** | P1 | Action manuelle post-publish : soumettre l'URL sur [Google Rich Results Test](https://search.google.com/test/rich-results). Le JSON-LD FAQPage est déjà en place et syntaxiquement valide. |
| **T7 — Google Search Console** | P2 | Nécessite une balise `<meta name="google-site-verification" content="...">` dans `index.html`. L'utilisateur doit fournir le code de vérification GSC. Ensuite : soumettre sitemap, inspecter URLs. |

### Plan d'implémentation (2 tickets codables)

**T2 — OG image** : Aucun code a modifier. Dès que l'image est fournie, remplacement direct de `public/og-image.png`.

**T7 — GSC verification** : Ajout d'une seule ligne dans `index.html` (dans `<head>`) :
```html
<meta name="google-site-verification" content="CODE_FOURNI_PAR_UTILISATEUR" />
```

### Actions requises de l'utilisateur

1. **Fournir l'image OG Canva** (T2) — glisser dans le chat
2. **Publier le site** (T1) — bouton Publish en haut à droite
3. **Fournir le code GSC** (T7) — depuis Google Search Console > Paramètres > Vérification
4. **Tester manuellement** (T1, T6) — opengraph.xyz + Rich Results Test post-publish

### Résumé

4 tickets sur 8 sont déjà complétés. Les 4 restants sont principalement des actions manuelles (publish, tests externes) avec au maximum 2 lignes de code à ajouter (T7). Aucun sprint de développement n'est nécessaire — il s'agit d'un sprint de validation et release.

