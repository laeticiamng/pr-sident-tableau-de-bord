import type { Language } from "@/i18n/types";

/**
 * Messages centralisés pour le badge « Présidente vérifiée » et le lien
 * vers le registre suisse MedReg. Garantit une traduction homogène FR/EN/DE
 * sur toutes les pages publiques et tous les états (succès/erreur).
 */
export const medregTranslations: Record<Language, {
  badgeLabel: string;
  badgeLabelShort: string;
  glnPrefix: string;
  ariaLabel: (profession: string, gln: string) => string;
  tooltipBody: (name: string, registry: string) => string;
  loadingLabel: string;
  unavailableLabel: string;
  liveAnnouncements: {
    loading: string;
    success: string;
    error: string;
    unavailable: string;
  };
  errors: {
    invalidUrlTitle: string;
    invalidUrlDescription: (label?: string) => string;
    insecureProtocolTitle: string;
    insecureProtocolDescription: (proto: string) => string;
    blockedTitle: string;
    blockedDescription: string;
    unavailableTitle: string;
    unavailableDescription: (gln: string) => string;
    genericTitle: string;
    genericDescription: string;
  };
  success: {
    openedTitle: string;
  };
  /** Strings used by the full PresidentCredentials card (`variant="panel"`). */
  panel: {
    title: string;
    description: (profession: string) => string;
    fieldName: string;
    fieldProfession: string;
    fieldGLN: string;
    fieldRegistry: string;
    verifyCta: string;
    inlineAriaLabel: (name: string) => string;
    /** Friendly label injected as the action label in error toasts. */
    registryLabel: string;
  };
}> = {
  fr: {
    badgeLabel: "Présidente vérifiée",
    badgeLabelShort: "Vérifiée",
    glnPrefix: "GLN",
    ariaLabel: (profession, gln) =>
      `Présidente vérifiée — ${profession} inscrite au registre MedReg sous le GLN ${gln}. Ouvrir le registre officiel.`,
    tooltipBody: (name, registry) =>
      `Inscription officielle de ${name} au registre suisse ${registry}. Cliquez pour vérifier sur le portail public.`,
    loadingLabel: "Ouverture du registre…",
    unavailableLabel: "Registre indisponible",
    liveAnnouncements: {
      loading: "Ouverture du registre MedReg en cours…",
      success: "Registre MedReg ouvert dans un nouvel onglet.",
      error: "Échec de l'ouverture du registre MedReg.",
      unavailable: "Le lien du registre MedReg est indisponible.",
    },
    errors: {
      invalidUrlTitle: "Lien invalide",
      invalidUrlDescription: (label) =>
        label ? `Impossible d'ouvrir ${label}.` : "Le lien fourni est invalide.",
      insecureProtocolTitle: "Lien non sécurisé",
      insecureProtocolDescription: (proto) => `Protocole non autorisé : ${proto}`,
      blockedTitle: "Ouverture bloquée par le navigateur",
      blockedDescription: "Le lien a été copié dans le presse-papiers.",
      unavailableTitle: "Registre MedReg indisponible",
      unavailableDescription: (gln) =>
        `Le lien officiel est temporairement invalide. Vous pouvez vérifier le GLN ${gln} sur https://www.healthregs.admin.ch.`,
      genericTitle: "Impossible d'ouvrir le lien",
      genericDescription: "Erreur inconnue du navigateur.",
    },
    success: {
      openedTitle: "Registre MedReg ouvert dans un nouvel onglet",
    },
    panel: {
      title: "Identité professionnelle vérifiée",
      description: (profession) =>
        `La Présidente d'EMOTIONSCARE SASU est inscrite au registre officiel des professions de santé de la Confédération suisse (MedReg) en tant que ${profession}. Cette inscription est publique et vérifiable par n'importe qui via son numéro GLN.`,
      fieldName: "Nom officiel",
      fieldProfession: "Profession",
      fieldGLN: "Numéro GLN",
      fieldRegistry: "Registre",
      verifyCta: "Vérifier sur le registre officiel",
      inlineAriaLabel: (name) =>
        `Vérifier l'inscription officielle de ${name} sur le registre MedReg`,
      registryLabel: "le registre MedReg",
    },
  },
  en: {
    badgeLabel: "Verified President",
    badgeLabelShort: "Verified",
    glnPrefix: "GLN",
    ariaLabel: (profession, gln) =>
      `Verified President — ${profession} listed on the MedReg registry under GLN ${gln}. Open the official registry.`,
    tooltipBody: (name, registry) =>
      `Official registration of ${name} on the Swiss ${registry} registry. Click to verify on the public portal.`,
    loadingLabel: "Opening registry…",
    unavailableLabel: "Registry unavailable",
    liveAnnouncements: {
      loading: "Opening the MedReg registry…",
      success: "MedReg registry opened in a new tab.",
      error: "Failed to open the MedReg registry.",
      unavailable: "The MedReg registry link is unavailable.",
    },
    errors: {
      invalidUrlTitle: "Invalid link",
      invalidUrlDescription: (label) =>
        label ? `Could not open ${label}.` : "The provided link is invalid.",
      insecureProtocolTitle: "Insecure link",
      insecureProtocolDescription: (proto) => `Protocol not allowed: ${proto}`,
      blockedTitle: "Browser blocked the popup",
      blockedDescription: "The link has been copied to your clipboard.",
      unavailableTitle: "MedReg registry unavailable",
      unavailableDescription: (gln) =>
        `The official link is temporarily invalid. You can verify GLN ${gln} on https://www.healthregs.admin.ch.`,
      genericTitle: "Could not open the link",
      genericDescription: "Unknown browser error.",
    },
    success: {
      openedTitle: "MedReg registry opened in a new tab",
    },
    panel: {
      title: "Verified professional identity",
      description: (profession) =>
        `The President of EMOTIONSCARE SASU is listed on the official health professions registry of the Swiss Confederation (MedReg) as a ${profession}. This registration is public and can be verified by anyone via her GLN number.`,
      fieldName: "Official name",
      fieldProfession: "Profession",
      fieldGLN: "GLN number",
      fieldRegistry: "Registry",
      verifyCta: "Verify on the official registry",
      inlineAriaLabel: (name) =>
        `Verify the official registration of ${name} on the MedReg registry`,
      registryLabel: "the MedReg registry",
    },
  },
  de: {
    badgeLabel: "Verifizierte Präsidentin",
    badgeLabelShort: "Verifiziert",
    glnPrefix: "GLN",
    ariaLabel: (profession, gln) =>
      `Verifizierte Präsidentin — ${profession} im MedReg-Register unter GLN ${gln} eingetragen. Offizielles Register öffnen.`,
    tooltipBody: (name, registry) =>
      `Offizielle Eintragung von ${name} im Schweizer ${registry}-Register. Klicken zur Überprüfung auf dem öffentlichen Portal.`,
    loadingLabel: "Register wird geöffnet…",
    unavailableLabel: "Register nicht verfügbar",
    liveAnnouncements: {
      loading: "MedReg-Register wird geöffnet…",
      success: "MedReg-Register in neuem Tab geöffnet.",
      error: "Öffnen des MedReg-Registers fehlgeschlagen.",
      unavailable: "Der MedReg-Register-Link ist nicht verfügbar.",
    },
    errors: {
      invalidUrlTitle: "Ungültiger Link",
      invalidUrlDescription: (label) =>
        label ? `${label} konnte nicht geöffnet werden.` : "Der bereitgestellte Link ist ungültig.",
      insecureProtocolTitle: "Unsicherer Link",
      insecureProtocolDescription: (proto) => `Protokoll nicht erlaubt: ${proto}`,
      blockedTitle: "Popup vom Browser blockiert",
      blockedDescription: "Der Link wurde in die Zwischenablage kopiert.",
      unavailableTitle: "MedReg-Register nicht verfügbar",
      unavailableDescription: (gln) =>
        `Der offizielle Link ist vorübergehend ungültig. Sie können GLN ${gln} auf https://www.healthregs.admin.ch überprüfen.`,
      genericTitle: "Link konnte nicht geöffnet werden",
      genericDescription: "Unbekannter Browserfehler.",
    },
    success: {
      openedTitle: "MedReg-Register in neuem Tab geöffnet",
    },
    panel: {
      title: "Verifizierte berufliche Identität",
      description: (profession) =>
        `Die Präsidentin von EMOTIONSCARE SASU ist im offiziellen Register der Gesundheitsberufe der Schweizerischen Eidgenossenschaft (MedReg) als ${profession} eingetragen. Diese Eintragung ist öffentlich und kann von jedem über ihre GLN-Nummer überprüft werden.`,
      fieldName: "Offizieller Name",
      fieldProfession: "Beruf",
      fieldGLN: "GLN-Nummer",
      fieldRegistry: "Register",
      verifyCta: "Im offiziellen Register überprüfen",
      inlineAriaLabel: (name) =>
        `Offizielle Eintragung von ${name} im MedReg-Register überprüfen`,
      registryLabel: "das MedReg-Register",
    },
  },
};