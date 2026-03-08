import { useEffect } from "react";

const SITE_NAME = "EMOTIONSCARE";
const DEFAULT_TITLE = "EMOTIONSCARE — Éditeur français de 10 logiciels SaaS innovants";
const DEFAULT_DESCRIPTION =
  "Éditeur de logiciels applicatifs français. 10 plateformes SaaS innovantes : santé des soignants, apprentissage médical, mémorisation musicale, médecine vasculaire, relocalisation, automatisation IA. Basé à Amiens.";
const SITE_URL = "https://president-cockpit-hq.lovable.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const HREFLANG_LOCALES = ["fr", "en", "de"] as const;

interface PageMetaOptions {
  title: string;
  description?: string;
  /** Adds <meta name="robots" content="noindex, nofollow"> */
  noindex?: boolean;
  /** Override canonical path (defaults to current pathname) */
  canonicalPath?: string;
  /** JSON-LD structured data schemas for GEO (Generative Engine Optimization) */
  jsonLd?: Record<string, unknown>[];
  /** Override OG image URL */
  ogImage?: string;
  /** Alt text for OG/Twitter image */
  ogImageAlt?: string;
}

function setMetaTag(property: string, content: string, isOg = true) {
  const attr = isOg ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Centralized hook for page-level SEO meta tags.
 * Sets document title, meta description, canonical link, robots directive,
 * Open Graph / Twitter Card tags, hreflang tags, and JSON-LD per page.
 * Restores defaults on unmount.
 */
export function usePageMeta({ title, description, noindex, canonicalPath, jsonLd, ogImage, ogImageAlt }: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`;
    const desc = description || DEFAULT_DESCRIPTION;
    const path = canonicalPath ?? window.location.pathname;
    const canonicalUrl = `${SITE_URL}${path}`;
    const image = ogImage || DEFAULT_OG_IMAGE;
    const imageAlt = ogImageAlt || "EMOTIONSCARE — Éditeur français de 10 plateformes SaaS innovantes";

    // Title
    document.title = fullTitle;

    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute("content", description);
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // Hreflang tags (multilingual SEO)
    const hreflangLinks: HTMLLinkElement[] = [];
    for (const locale of HREFLANG_LOCALES) {
      const link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", locale);
      link.setAttribute("href", canonicalUrl);
      document.head.appendChild(link);
      hreflangLinks.push(link);
    }
    // x-default → French (primary language)
    const xDefaultLink = document.createElement("link");
    xDefaultLink.setAttribute("rel", "alternate");
    xDefaultLink.setAttribute("hreflang", "x-default");
    xDefaultLink.setAttribute("href", canonicalUrl);
    document.head.appendChild(xDefaultLink);
    hreflangLinks.push(xDefaultLink);

    // OG tags
    setMetaTag("og:title", fullTitle);
    setMetaTag("og:description", desc);
    setMetaTag("og:url", canonicalUrl);
    setMetaTag("og:image", image);
    setMetaTag("og:image:alt", imageAlt);

    // Twitter tags
    setMetaTag("twitter:title", fullTitle, false);
    setMetaTag("twitter:description", desc, false);
    setMetaTag("twitter:image", image, false);
    setMetaTag("twitter:image:alt", imageAlt, false);

    // Robots noindex
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", "noindex, nofollow");
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    // JSON-LD structured data (GEO optimization)
    const jsonLdScripts: HTMLScriptElement[] = [];
    if (jsonLd?.length) {
      for (const schema of jsonLd) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schema);
        script.dataset.geo = "true";
        document.head.appendChild(script);
        jsonLdScripts.push(script);
      }
    }

    // Cleanup: restore defaults
    return () => {
      document.title = DEFAULT_TITLE;
      if (metaDescription) {
        metaDescription.setAttribute("content", DEFAULT_DESCRIPTION);
      }
      if (canonicalLink) {
        canonicalLink.remove();
      }
      // Remove hreflang links
      for (const link of hreflangLinks) {
        link.remove();
      }
      if (noindex && robotsMeta) {
        robotsMeta.remove();
      }
      // Restore default OG tags
      setMetaTag("og:title", DEFAULT_TITLE);
      setMetaTag("og:description", DEFAULT_DESCRIPTION);
      setMetaTag("og:url", SITE_URL);
      setMetaTag("og:image", DEFAULT_OG_IMAGE);
      setMetaTag("og:image:alt", "EMOTIONSCARE — Éditeur français de 10 plateformes SaaS innovantes");
      setMetaTag("twitter:title", DEFAULT_TITLE, false);
      setMetaTag("twitter:description", DEFAULT_DESCRIPTION, false);
      setMetaTag("twitter:image", DEFAULT_OG_IMAGE, false);
      setMetaTag("twitter:image:alt", "EMOTIONSCARE — Éditeur français de 10 plateformes SaaS innovantes", false);
      // Remove injected JSON-LD scripts
      for (const script of jsonLdScripts) {
        script.remove();
      }
    };
  }, [title, description, noindex, canonicalPath, jsonLd, ogImage, ogImageAlt]);
}
