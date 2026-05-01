import { forwardRef } from "react";
import { VerifiedPresidentBadge } from "@/components/VerifiedPresidentBadge";
import { cn } from "@/lib/utils";

interface HeroVerifiedSlotProps {
  /** `dark` pour les hero sombres (Home, Vision, Contact), `light` pour fond clair (Trust). */
  tone?: "light" | "dark";
  /** Classe additionnelle si besoin de surcharge ponctuelle (rare). */
  className?: string;
}

/**
 * Emplacement canonique du badge « Présidente vérifiée » sous les hero
 * publics. Sert de point d'ancrage unique : toute page publique doit utiliser
 * ce slot pour garantir un spacing (`mt-6`), un alignement (`justify-center`)
 * et une taille (`sm`, sans GLN) strictement identiques.
 *
 * Ne pas instancier `VerifiedPresidentBadge` directement dans un hero —
 * passer toujours par ce composant.
 */
export const HeroVerifiedSlot = forwardRef<HTMLDivElement, HeroVerifiedSlotProps>(
  ({ tone = "dark", className }, ref) => {
    return (
      <div ref={ref} className={cn("mt-6 flex justify-center", className)}>
        <VerifiedPresidentBadge size="sm" tone={tone} showGLN={false} />
      </div>
    );
  },
);
HeroVerifiedSlot.displayName = "HeroVerifiedSlot";

export default HeroVerifiedSlot;