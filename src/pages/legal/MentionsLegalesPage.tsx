import { COMPANY_PROFILE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function MentionsLegalesPage() {
  usePageMeta({
    title: "Mentions Légales",
    description: `Mentions légales d'${COMPANY_PROFILE.legalName}, éditeur de logiciels applicatifs. SIREN ${COMPANY_PROFILE.siren}, siège à Amiens.`,
    noindex: true,
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Badge variant="subtle" className="mb-4">Légal</Badge>
            <h1 className="text-headline-1 mb-4">Mentions Légales</h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : Février 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl prose prose-slate">
            <h2>Éditeur du site</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="font-medium py-2">Raison sociale</td>
                  <td className="py-2">{COMPANY_PROFILE.legalName}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">Forme juridique</td>
                  <td className="py-2">{COMPANY_PROFILE.form}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">SIREN</td>
                  <td className="py-2">{COMPANY_PROFILE.siren}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">SIRET (siège)</td>
                  <td className="py-2">{COMPANY_PROFILE.siret}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">N° TVA</td>
                  <td className="py-2">{COMPANY_PROFILE.vat}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">Siège social</td>
                  <td className="py-2">{COMPANY_PROFILE.address}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">Activité</td>
                  <td className="py-2">{COMPANY_PROFILE.activity}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">Capital social</td>
                  <td className="py-2">{COMPANY_PROFILE.capital}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">RCS</td>
                  <td className="py-2">{COMPANY_PROFILE.rcs}</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">Présidente</td>
                  <td className="py-2">{COMPANY_PROFILE.president}</td>
                </tr>
              </tbody>
            </table>

            <h2>Hébergement</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="font-medium py-2">Hébergeur</td>
                  <td className="py-2">Lovable (Gptengineer, Inc.)</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">Infrastructure</td>
                  <td className="py-2">Amazon Web Services (AWS) via Supabase — Région eu-west (Irlande, UE)</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">CDN / Frontend</td>
                  <td className="py-2">Netlify / Cloudflare Pages</td>
                </tr>
                <tr>
                  <td className="font-medium py-2">Contact hébergeur</td>
                  <td className="py-2">support@lovable.dev</td>
                </tr>
              </tbody>
            </table>

            <h2>Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, logos, graphismes, etc.) 
              est la propriété exclusive d'EMOTIONSCARE SASU, sauf mention contraire. 
              Toute reproduction, représentation, modification ou adaptation, totale ou partielle, 
              est strictement interdite sans autorisation préalable écrite.
            </p>

            <h2>Responsabilité</h2>
            <p>
              EMOTIONSCARE SASU s'efforce d'assurer l'exactitude des informations diffusées 
              sur ce site. Toutefois, elle ne saurait être tenue responsable des omissions, 
              inexactitudes ou carences dans la mise à jour.
            </p>

            <h2>Contact</h2>
            <p>
              Pour toute question relative aux présentes mentions légales, 
              vous pouvez nous contacter via notre page de contact.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
