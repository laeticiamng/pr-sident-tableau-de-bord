import { Badge } from "@/components/ui/badge";
import { COMPANY_PROFILE } from "@/lib/constants";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "@/contexts/LanguageContext";
import { legalTranslations } from "@/i18n/legal";

export default function CGVPage() {
  const t = useTranslation(legalTranslations);
  const c = t.cgv;

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
            {c.articles.map((article, i) => (
              <div key={i}>
                <h2>{article.title}</h2>
                {i === 1 ? (
                  <p>
                    {COMPANY_PROFILE.legalName}<br />
                    {COMPANY_PROFILE.form} au capital de {COMPANY_PROFILE.capital}<br />
                    SIREN : {COMPANY_PROFILE.siren}<br />
                    Siège social : {COMPANY_PROFILE.address}<br />
                    RCS : {COMPANY_PROFILE.rcs}
                  </p>
                ) : (
                  <p>{article.text.replace(/\{company\}/g, COMPANY_PROFILE.legalName)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
