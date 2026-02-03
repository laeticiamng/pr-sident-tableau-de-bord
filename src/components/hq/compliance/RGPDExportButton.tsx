import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface RGPDExportButtonProps {
  className?: string;
}

export function RGPDExportButton({ className }: RGPDExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Simuler un délai de génération
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Générer le contenu du rapport RGPD
      const report = generateRGPDReport();

      // Créer et télécharger le fichier
      const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RGPD_Registre_EMOTIONSCARE_${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Export RGPD généré", {
        description: "Le registre a été téléchargé avec succès.",
      });
    } catch (error) {
      toast.error("Erreur d'export", {
        description: "Impossible de générer le registre RGPD.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Exporter Registre RGPD
    </Button>
  );
}

function generateRGPDReport(): string {
  const date = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
================================================================================
                     REGISTRE DES TRAITEMENTS DE DONNÉES
                           EMOTIONSCARE SASU
================================================================================

Date de génération : ${date}
Responsable du traitement : Motongane Laeticia (Présidente)
SIREN : 944 505 445

--------------------------------------------------------------------------------
1. TRAITEMENT : GESTION DES UTILISATEURS
--------------------------------------------------------------------------------
Finalité : Authentification et gestion des comptes utilisateurs
Base légale : Exécution du contrat (Art. 6.1.b RGPD)
Catégories de données : Email, mot de passe hashé, date d'inscription
Durée de conservation : Durée du compte + 3 ans après suppression
Destinataires : Internes uniquement
Transfert hors UE : Non (hébergement Supabase Europe)
Mesures de sécurité : 
  - Chiffrement des mots de passe (bcrypt)
  - Row Level Security (RLS) sur toutes les tables
  - Authentification JWT

--------------------------------------------------------------------------------
2. TRAITEMENT : ANALYTICS & MONITORING
--------------------------------------------------------------------------------
Finalité : Amélioration des services et monitoring technique
Base légale : Intérêt légitime (Art. 6.1.f RGPD)
Catégories de données : Logs de connexion, métriques d'usage anonymisées
Durée de conservation : 12 mois glissants
Destinataires : Internes uniquement
Transfert hors UE : Non
Mesures de sécurité :
  - Pseudonymisation des données
  - Accès restreint aux administrateurs

--------------------------------------------------------------------------------
3. TRAITEMENT : SUPPORT CLIENT
--------------------------------------------------------------------------------
Finalité : Réponse aux demandes et tickets de support
Base légale : Exécution du contrat (Art. 6.1.b RGPD)
Catégories de données : Email, contenu des demandes, historique tickets
Durée de conservation : 5 ans après clôture du ticket
Destinataires : Équipe support
Transfert hors UE : Non
Mesures de sécurité :
  - Accès authentifié uniquement
  - Logs d'audit des actions

--------------------------------------------------------------------------------
4. TRAITEMENT : FACTURATION
--------------------------------------------------------------------------------
Finalité : Émission des factures et gestion des paiements
Base légale : Obligation légale (Art. 6.1.c RGPD)
Catégories de données : Coordonnées, données bancaires (via Stripe)
Durée de conservation : 10 ans (obligation comptable)
Destinataires : Comptabilité, Stripe (sous-traitant)
Transfert hors UE : Non (Stripe Europe)
Mesures de sécurité :
  - PCI-DSS compliance via Stripe
  - Aucun stockage direct des CB

--------------------------------------------------------------------------------
DROITS DES PERSONNES CONCERNÉES
--------------------------------------------------------------------------------
Les utilisateurs disposent des droits suivants :
- Droit d'accès (Art. 15 RGPD)
- Droit de rectification (Art. 16 RGPD)
- Droit à l'effacement (Art. 17 RGPD)
- Droit à la portabilité (Art. 20 RGPD)
- Droit d'opposition (Art. 21 RGPD)

Contact DPO : dpo@emotionscare.fr
Délai de réponse : 30 jours maximum

--------------------------------------------------------------------------------
SOUS-TRAITANTS
--------------------------------------------------------------------------------
| Sous-traitant | Service           | Localisation | Garanties         |
|---------------|-------------------|--------------|-------------------|
| Supabase      | Base de données   | UE (AWS)     | Clauses Standard  |
| Stripe        | Paiements         | UE           | PCI-DSS           |
| Lovable       | Hébergement       | UE           | RGPD compliant    |

--------------------------------------------------------------------------------
HISTORIQUE DES MODIFICATIONS
--------------------------------------------------------------------------------
03/02/2026 - Création initiale du registre
03/02/2026 - Ajout des mesures RLS

================================================================================
                        FIN DU REGISTRE
================================================================================
`;
}
