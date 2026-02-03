import { Badge } from "@/components/ui/badge";
import { COMPANY_PROFILE } from "@/lib/constants";
import { Building2, FileText, MapPin, Calendar, User, CreditCard } from "lucide-react";

export default function EntreprisePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Profil de l'Entreprise</h1>
        <p className="text-muted-foreground text-lg">
          Informations légales et administratives d'EMOTIONSCARE SASU.
        </p>
      </div>

      {/* Company Header */}
      <div className="card-executive p-8">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{COMPANY_PROFILE.legalName}</h2>
            <p className="text-muted-foreground">{COMPANY_PROFILE.activity}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="success">Active</Badge>
              <Badge variant="subtle">{COMPANY_PROFILE.form}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Identification */}
        <div className="card-executive p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Identification</h3>
          </div>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">SIREN</dt>
              <dd className="font-medium font-mono">{COMPANY_PROFILE.siren}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">SIRET (siège)</dt>
              <dd className="font-medium font-mono">{COMPANY_PROFILE.siret}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">N° TVA</dt>
              <dd className="font-medium font-mono">{COMPANY_PROFILE.vat}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">RCS</dt>
              <dd className="font-medium">{COMPANY_PROFILE.rcs}</dd>
            </div>
          </dl>
        </div>

        {/* Address */}
        <div className="card-executive p-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Siège Social</h3>
          </div>
          <p className="text-lg font-medium mb-4">{COMPANY_PROFILE.address}</p>
          <div className="p-4 rounded-lg bg-secondary/30 text-center text-muted-foreground">
            📍 Amiens, Hauts-de-France
          </div>
        </div>

        {/* Company Details */}
        <div className="card-executive p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Informations Légales</h3>
          </div>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Forme juridique</dt>
              <dd className="font-medium">{COMPANY_PROFILE.form}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date de création</dt>
              <dd className="font-medium">{COMPANY_PROFILE.creationDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Activité</dt>
              <dd className="font-medium text-right max-w-[200px]">{COMPANY_PROFILE.activity}</dd>
            </div>
          </dl>
        </div>

        {/* Capital & Leadership */}
        <div className="card-executive p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Direction</h3>
          </div>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Président(e)</dt>
              <dd className="font-medium">{COMPANY_PROFILE.president}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-muted-foreground">Capital social</dt>
              <dd className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {COMPANY_PROFILE.capital}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
