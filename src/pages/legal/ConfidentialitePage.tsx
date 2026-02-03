import { Badge } from "@/components/ui/badge";
import { COMPANY_PROFILE } from "@/lib/constants";

export default function ConfidentialitePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Badge variant="subtle" className="mb-4">Légal</Badge>
            <h1 className="text-headline-1 mb-4">Politique de Confidentialité</h1>
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
            <h2>Introduction</h2>
            <p>
              {COMPANY_PROFILE.legalName} s'engage à protéger la vie privée des utilisateurs 
              de ses sites et applications. Cette politique décrit les données que nous 
              collectons et comment nous les utilisons.
            </p>

            <h2>Données collectées</h2>
            <p>Nous pouvons collecter les types de données suivants :</p>
            <ul>
              <li>Données d'identification (nom, prénom, email)</li>
              <li>Données de connexion (logs, adresse IP)</li>
              <li>Données de navigation (cookies, préférences)</li>
            </ul>

            <h2>Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Fournir et améliorer nos services</li>
              <li>Répondre à vos demandes de contact</li>
              <li>Assurer la sécurité de nos plateformes</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2>Base légale</h2>
            <p>
              Le traitement de vos données repose sur votre consentement, l'exécution 
              d'un contrat, ou nos intérêts légitimes selon les cas.
            </p>

            <h2>Conservation des données</h2>
            <p>
              Vos données sont conservées pendant la durée nécessaire aux finalités 
              pour lesquelles elles ont été collectées, et conformément aux 
              obligations légales applicables.
            </p>

            <h2>Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous via notre page de contact.
            </p>

            <h2>Cookies</h2>
            <p>
              Nous utilisons des cookies essentiels au fonctionnement du site. 
              Des cookies analytiques peuvent être utilisés avec votre consentement.
            </p>

            <h2>Contact DPO</h2>
            <p>
              Pour toute question relative à la protection de vos données, 
              contactez la Présidente : {COMPANY_PROFILE.president}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
