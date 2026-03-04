import { COMPANY_PROFILE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "@/contexts/LanguageContext";
import { legalTranslations } from "@/i18n/legal";

export default function MentionsLegalesPage() {
  const t = useTranslation(legalTranslations);

  usePageMeta({
    title: t.mentions.title,
    description: `${t.mentions.title} — ${COMPANY_PROFILE.legalName}`,
    noindex: true,
  });

  return (
    <div className="flex flex-col">
      <section className="py-16 md:py-20 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Badge variant="subtle" className="mb-4">{t.badge}</Badge>
            <h1 className="text-headline-1 mb-4">{t.mentions.title}</h1>
            <p className="text-muted-foreground">{t.lastUpdate}</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl prose prose-slate">
            <h2>{t.mentions.editor}</h2>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(t.mentions.fields).map(([key, label]) => (
                  <tr key={key}>
                    <td className="font-medium py-2">{label}</td>
                    <td className="py-2">{COMPANY_PROFILE[key as keyof typeof COMPANY_PROFILE]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>{t.mentions.hosting}</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="font-medium py-2">{t.mentions.hostingFields.host}</td><td className="py-2">Lovable (Gptengineer, Inc.)</td></tr>
                <tr><td className="font-medium py-2">{t.mentions.hostingFields.infrastructure}</td><td className="py-2">Amazon Web Services (AWS) via Supabase — Région eu-west (Irlande, UE)</td></tr>
                <tr><td className="font-medium py-2">{t.mentions.hostingFields.cdn}</td><td className="py-2">Netlify / Cloudflare Pages</td></tr>
                <tr><td className="font-medium py-2">{t.mentions.hostingFields.contact}</td><td className="py-2">support@lovable.dev</td></tr>
              </tbody>
            </table>

            <h2>{t.mentions.ip}</h2>
            <p>{t.mentions.ipText}</p>

            <h2>{t.mentions.liability}</h2>
            <p>{t.mentions.liabilityText}</p>

            <h2>{t.mentions.contact}</h2>
            <p>{t.mentions.contactText}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
