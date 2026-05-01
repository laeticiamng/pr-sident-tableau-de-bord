import { toast } from "sonner";

export type OpenExternalLinkStatus =
  | "success"
  | "invalid_url"
  | "insecure_protocol"
  | "blocked"
  | "error";

export interface OpenExternalLinkResult {
  ok: boolean;
  status: OpenExternalLinkStatus;
  reason?: string;
}

/**
 * Messages localisés optionnels — si non fournis, des libellés français
 * par défaut sont utilisés (compatibilité ascendante avec les appels
 * existants).
 */
export interface OpenExternalLinkMessages {
  invalidUrlTitle?: string;
  invalidUrlDescription?: string;
  insecureProtocolTitle?: string;
  insecureProtocolDescription?: (proto: string) => string;
  blockedTitle?: string;
  blockedDescription?: string;
  genericTitle?: string;
  genericDescription?: string;
}

/**
 * Ouvre un lien externe en validant l'URL (https obligatoire) et en gérant
 * proprement les erreurs (URL invalide, popup bloqué, indisponibilité).
 * Affiche un toast utilisateur en cas d'échec et retourne un statut détaillé
 * (utile pour audit log analytics).
 */
export const openExternalLink = (
  url: string,
  label?: string,
  messages?: OpenExternalLinkMessages,
): OpenExternalLinkResult => {
  const m = messages ?? {};
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    toast.error(m.invalidUrlTitle ?? "Lien invalide", {
      description:
        m.invalidUrlDescription ?? (label ? `Impossible d'ouvrir ${label}.` : url),
    });
    return { ok: false, status: "invalid_url", reason: "URL parse failed" };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    toast.error(m.insecureProtocolTitle ?? "Lien non sécurisé", {
      description: m.insecureProtocolDescription
        ? m.insecureProtocolDescription(parsed.protocol)
        : `Protocole non autorisé : ${parsed.protocol}`,
    });
    return { ok: false, status: "insecure_protocol", reason: parsed.protocol };
  }

  try {
    const win = window.open(parsed.toString(), "_blank", "noopener,noreferrer");
    if (!win) {
      void navigator.clipboard?.writeText(parsed.toString()).catch(() => {});
      toast.warning(m.blockedTitle ?? "Ouverture bloquée par le navigateur", {
        description:
          m.blockedDescription ?? "Le lien a été copié dans le presse-papiers.",
      });
      return { ok: false, status: "blocked", reason: "popup_blocked" };
    }
    return { ok: true, status: "success" };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Erreur inconnue du navigateur.";
    toast.error(m.genericTitle ?? "Impossible d'ouvrir le lien", {
      description:
        m.genericDescription ?? reason,
    });
    return { ok: false, status: "error", reason };
  }
};