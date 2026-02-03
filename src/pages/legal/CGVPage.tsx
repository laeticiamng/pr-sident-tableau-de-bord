import { Badge } from "@/components/ui/badge";
import { COMPANY_PROFILE } from "@/lib/constants";

export default function CGVPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Badge variant="subtle" className="mb-4">Légal</Badge>
            <h1 className="text-headline-1 mb-4">Conditions Générales de Vente</h1>
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
            <h2>Article 1 - Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations 
              contractuelles entre {COMPANY_PROFILE.legalName} et ses clients 
              pour la fourniture de services logiciels.
            </p>

            <h2>Article 2 - Identification du prestataire</h2>
            <p>
              {COMPANY_PROFILE.legalName}<br />
              {COMPANY_PROFILE.form} au capital de {COMPANY_PROFILE.capital}<br />
              SIREN : {COMPANY_PROFILE.siren}<br />
              Siège social : {COMPANY_PROFILE.address}<br />
              RCS : {COMPANY_PROFILE.rcs}
            </p>

            <h2>Article 3 - Services proposés</h2>
            <p>
              {COMPANY_PROFILE.legalName} propose des services d'édition de logiciels 
              applicatifs, incluant le développement, la maintenance et le support 
              de solutions numériques.
            </p>

            <h2>Article 4 - Prix et paiement</h2>
            <p>
              Les prix sont indiqués en euros et hors taxes sauf mention contraire. 
              La TVA applicable est celle en vigueur au jour de la facturation. 
              Les modalités de paiement sont précisées dans chaque devis ou contrat.
            </p>

            <h2>Article 5 - Livraison</h2>
            <p>
              Les délais de livraison sont donnés à titre indicatif. Un retard de 
              livraison ne peut donner lieu à aucune pénalité ou indemnité, ni 
              motiver l'annulation de la commande.
            </p>

            <h2>Article 6 - Propriété intellectuelle</h2>
            <p>
              Sauf accord contraire, {COMPANY_PROFILE.legalName} conserve la propriété 
              intellectuelle des développements réalisés. Une licence d'utilisation 
              est accordée au client selon les termes du contrat.
            </p>

            <h2>Article 7 - Responsabilité</h2>
            <p>
              La responsabilité de {COMPANY_PROFILE.legalName} est limitée au montant 
              des sommes effectivement perçues au titre du contrat concerné.
            </p>

            <h2>Article 8 - Résiliation</h2>
            <p>
              En cas de manquement grave de l'une des parties à ses obligations, 
              le contrat pourra être résilié de plein droit après mise en demeure 
              restée infructueuse.
            </p>

            <h2>Article 9 - Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français. Tout litige sera 
              de la compétence exclusive des tribunaux d'Amiens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
