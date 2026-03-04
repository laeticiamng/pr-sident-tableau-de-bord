import { Badge } from "@/components/ui/badge";
import { COMPANY_PROFILE } from "@/lib/constants";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "@/contexts/LanguageContext";
import { cookiePolicyTranslations } from "@/i18n/cookie-policy";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export default function CookiesPage() {
  const t = useTranslation(cookiePolicyTranslations);
  const { reopenBanner } = useCookieConsent();

  usePageMeta({
    title: t.title,
    description: `${t.title} — ${COMPANY_PROFILE.legalName}`,
    noindex: true,
  });

  return (
    <div className="flex flex-col">
      <section className="py-16 md:py-20 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Badge variant="subtle" className="mb-4">{t.badge}</Badge>
            <h1 className="text-headline-1 mb-4">{t.title}</h1>
            <p className="text-muted-foreground">{t.lastUpdate}</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
            <h2>{t.intro.title}</h2>
            <p>{t.intro.text}</p>

            <h2>{t.whatIs.title}</h2>
            <p>{t.whatIs.text}</p>

            <h2>{t.types.title}</h2>

            {/* Essential cookies */}
            <h3>{t.types.essential.title}</h3>
            <p>{t.types.essential.description}</p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>{t.tableHeaders.name}</th>
                    <th>{t.tableHeaders.purpose}</th>
                    <th>{t.tableHeaders.duration}</th>
                    <th>{t.tableHeaders.provider}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.types.essential.cookies.map((c, i) => (
                    <tr key={i}>
                      <td className="font-mono text-sm">{c.name}</td>
                      <td>{c.purpose}</td>
                      <td>{c.duration}</td>
                      <td>{c.provider}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Analytics cookies */}
            <h3>{t.types.analytics.title}</h3>
            <p>{t.types.analytics.description}</p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>{t.tableHeaders.name}</th>
                    <th>{t.tableHeaders.purpose}</th>
                    <th>{t.tableHeaders.duration}</th>
                    <th>{t.tableHeaders.provider}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.types.analytics.cookies.map((c, i) => (
                    <tr key={i}>
                      <td className="font-mono text-sm">{c.name}</td>
                      <td>{c.purpose}</td>
                      <td>{c.duration}</td>
                      <td>{c.provider}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>{t.consent.title}</h2>
            <p>{t.consent.text}</p>

            <h2>{t.manage.title}</h2>
            <p>{t.manage.text}</p>

            <div className="not-prose my-6">
              <Button onClick={reopenBanner} variant="outline" className="gap-2">
                <Cookie className="h-4 w-4" />
                {t.manage.button}
              </Button>
            </div>

            <h2>{t.browser.title}</h2>
            <p>{t.browser.text}</p>

            <h2>{t.thirdParty.title}</h2>
            <p>{t.thirdParty.text}</p>

            <h2>{t.rights.title}</h2>
            <p>{t.rights.text}</p>

            <h2>{t.contact.title}</h2>
            <p>{t.contact.text} {COMPANY_PROFILE.president}.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
