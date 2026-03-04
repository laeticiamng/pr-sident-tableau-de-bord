

## Plan : Internationalisation FR/EN/DE des pages publiques

### Approche technique

Système i18n léger sans dépendance externe : un `LanguageContext` React + dictionnaires de traduction par page + sélecteur de langue dans le header public.

### Architecture

```text
src/
├── contexts/LanguageContext.tsx      ← Context + hook useLanguage()
├── i18n/
│   ├── types.ts                     ← Type Language = 'fr' | 'en' | 'de'
│   ├── common.ts                    ← Header, footer, boutons communs
│   ├── home.ts                      ← Textes HomePage
│   ├── platforms.ts                 ← Textes PlateformesPage
│   ├── vision.ts                    ← Textes VisionPage
│   ├── contact.ts                   ← Textes ContactPage
│   ├── trust.ts                     ← Textes TrustPage
│   ├── status.ts                    ← Textes StatusPage
│   └── legal.ts                     ← Textes CGV, Mentions, Confidentialité
├── components/LanguageSwitcher.tsx   ← Dropdown FR/EN/DE avec drapeaux
```

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `PublicHeader.tsx` | Ajouter `<LanguageSwitcher />` à côté du ThemeToggle |
| `PublicFooter.tsx` | Traduire labels navigation + légal |
| `PublicLayout.tsx` | Wrapper avec `<LanguageProvider>` |
| `HomePage.tsx` | Remplacer textes hardcodés par `t.hero.title`, etc. |
| `PlateformesPage.tsx` | Idem |
| `VisionPage.tsx` | Idem |
| `ContactPage.tsx` | Idem |
| `TrustPage.tsx` | Idem |
| `StatusPage.tsx` | Idem |
| 3 pages légales | Idem |

### Fonctionnement

1. **LanguageContext** stocke la langue dans `localStorage` (clé `preferred-lang`, défaut `fr`)
2. **`useTranslation(page)`** retourne l'objet de traductions pour la page courante
3. **LanguageSwitcher** : dropdown compact avec 🇫🇷 🇬🇧 🇩🇪, placé dans le header public uniquement
4. Les pages HQ restent 100% en français (non impactées)

### Volume estimé

- ~10 nouveaux fichiers (contexte + 8 dictionnaires + switcher)
- ~10 fichiers modifiés (pages + layout + header + footer)
- ~2000 lignes de traductions (FR déjà existant, EN + DE à créer)

### Détail technique

Chaque dictionnaire suit la structure :
```typescript
// src/i18n/home.ts
export const homeTranslations = {
  fr: {
    hero: { badge: "Siège Social Numérique", title: "EMOTIONSCARE", ... },
    features: { sectionTitle: "Fonctionnalités du Siège Numérique", ... },
  },
  en: {
    hero: { badge: "Digital Headquarters", title: "EMOTIONSCARE", ... },
    features: { sectionTitle: "Digital HQ Features", ... },
  },
  de: {
    hero: { badge: "Digitaler Hauptsitz", title: "EMOTIONSCARE", ... },
    features: { sectionTitle: "Funktionen des digitalen Hauptsitzes", ... },
  },
} as const;
```

Le hook :
```typescript
const { t } = useTranslation('home');
// t.hero.title → string selon la langue active
```

