import { useEffect } from "react";

const SITE_NAME = "EMOTIONSCARE";
const DEFAULT_TITLE = "EMOTIONSCARE — Siège Social Numérique";
const DEFAULT_DESCRIPTION =
  "Éditeur de logiciels applicatifs français. 7 plateformes innovantes pilotées depuis notre siège numérique.";
const SITE_URL = "https://president-cockpit-hq.lovable.app";

interface PageMetaOptions {
  title: string;
  description?: string;
  /** Adds <meta name="robots" content="noindex, nofollow"> */
  noindex?: boolean;
  /** Override canonical path (defaults to current pathname) */
  canonicalPath?: string;
}

/**
 * Centralized hook for page-level SEO meta tags.
 * Sets document title, meta description, canonical link, and robots directive.
 * Restores defaults on unmount.
 */
export function usePageMeta({ title, description, noindex, canonicalPath }: PageMetaOptions) {
  useEffect(() => {
    // Title
    document.title = `${title} — ${SITE_NAME}`;

    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute("content", description);
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const path = canonicalPath ?? window.location.pathname;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", `${SITE_URL}${path}`);

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

    // Cleanup: restore defaults
    return () => {
      document.title = DEFAULT_TITLE;
      if (metaDescription) {
        metaDescription.setAttribute("content", DEFAULT_DESCRIPTION);
      }
      if (canonicalLink) {
        canonicalLink.remove();
      }
      if (noindex && robotsMeta) {
        robotsMeta.remove();
      }
    };
  }, [title, description, noindex, canonicalPath]);
}
