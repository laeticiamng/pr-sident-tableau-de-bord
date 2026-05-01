import { toast } from "sonner";

/**
 * Ouvre un lien externe en validant l'URL (https obligatoire) et en gérant
 * proprement les erreurs (URL invalide, popup bloqué, indisponibilité).
 * Affiche un toast utilisateur en cas d'échec.
 */
export const openExternalLink = (url: string, label?: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    toast.error("Lien invalide", {
      description: label ? `Impossible d'ouvrir ${label}.` : url,
    });
    return false;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    toast.error("Lien non sécurisé", {
      description: `Protocole non autorisé : ${parsed.protocol}`,
    });
    return false;
  }

  try {
    const win = window.open(parsed.toString(), "_blank", "noopener,noreferrer");
    if (!win) {
      // Popup bloqué — on tente une copie en clipboard pour aider l'utilisateur.
      void navigator.clipboard?.writeText(parsed.toString()).catch(() => {});
      toast.warning("Ouverture bloquée par le navigateur", {
        description: "Le lien a été copié dans le presse-papiers.",
      });
      return false;
    }
    return true;
  } catch (err) {
    toast.error("Impossible d'ouvrir le lien", {
      description:
        err instanceof Error ? err.message : "Erreur inconnue du navigateur.",
    });
    return false;
  }
};