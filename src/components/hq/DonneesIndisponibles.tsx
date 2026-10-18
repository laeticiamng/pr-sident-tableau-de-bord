import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUCUNE_SOURCE_VERIFIEE, DONNEES_INDISPONIBLES } from "@/lib/stripe-kpis-adapter";

interface DonneesIndisponiblesProps {
  /** Titre de la carte (ex. « Funnel de conversion »). Sans titre : bloc seul, sans carte. */
  title?: string;
  description?: string;
  /** Une phrase expliquant pourquoi (par défaut : aucune source vérifiée connectée). */
  reason?: string;
  className?: string;
}

/**
 * État vide honnête pour tout chiffre sans source vérifiée : « Données indisponibles »
 * et une raison, jamais de nombre.
 */
export function DonneesIndisponibles({
  title,
  description,
  reason = AUCUNE_SOURCE_VERIFIEE,
  className,
}: DonneesIndisponiblesProps) {
  const contenu = (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg",
        !title && className,
      )}
    >
      <Database className="h-8 w-8 text-muted-foreground/40 mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-muted-foreground">{DONNEES_INDISPONIBLES}</p>
      <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">{reason}</p>
    </div>
  );

  if (!title) return contenu;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{contenu}</CardContent>
    </Card>
  );
}
