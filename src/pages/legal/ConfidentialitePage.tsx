import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { COMPANY_PROFILE } from "@/lib/constants";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "@/contexts/LanguageContext";
import { legalTranslations } from "@/i18n/legal";

export default function ConfidentialitePage() {
  const t = useTranslation(legalTranslations);
  const c = t.confidentialite;

  usePageMeta({
    title: c.title,
    description: `${c.title} — ${COMPANY_PROFILE.legalName}`,
    noindex: true,
  });

  return (
    <div className="flex flex-col">
      <section className="py-16 md:py-20 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Badge variant="subtle" className="mb-4">{t.badge}</Badge>
            <h1 className="text-headline-1 mb-4">{c.title}</h1>
            <p className="text-muted-foreground">{t.lastUpdate}</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
            <h2>{c.intro}</h2>
            <p>{COMPANY_PROFILE.legalName} {c.introText}</p>

            <h2>{c.collected}</h2>
            <p>{c.collectedIntro}</p>
            <ul>{c.collectedItems.map((item, i) => <li key={i}>{item}</li>)}</ul>

            <h2>{c.purposes}</h2>
            <p>{c.purposesIntro}</p>
            <ul>{c.purposesItems.map((item, i) => <li key={i}>{item}</li>)}</ul>

            <h2>{c.legalBasis}</h2>
            <p>{c.legalBasisText}</p>

            <h2>{c.retention}</h2>
            <p>{c.retentionText}</p>

            <h2>{c.rights}</h2>
            <p>{c.rightsIntro}</p>
            <ul>{c.rightsItems.map((item, i) => <li key={i}>{item}</li>)}</ul>
            <p>{c.rightsExercise}</p>

            <h2>{c.cookies}</h2>
            <p>{c.cookiesText}{" "}
              <Link to="/legal/cookies" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                {c.cookiesLinkText}
              </Link>.
            </p>

            <h2>{c.dpo}</h2>
            <p>{c.dpoText} {COMPANY_PROFILE.president}.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
