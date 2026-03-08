export const validationTranslations = {
  fr: {
    email: {
      required: "L'email est requis",
      invalid: "Format d'email invalide",
      tooLong: "L'email ne peut pas dépasser 255 caractères",
    },
    password: {
      tooShort: "Le mot de passe doit contenir au moins 8 caractères",
      tooLong: "Le mot de passe ne peut pas dépasser 128 caractères",
      weak: "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
      required: "Le mot de passe est requis",
      confirm: "Confirmez le mot de passe",
      mismatch: "Les mots de passe ne correspondent pas",
    },
    name: {
      required: "Le nom est requis",
      tooLong: "Le nom ne peut pas dépasser 100 caractères",
      invalid: "Le nom contient des caractères invalides",
    },
    phone: {
      invalid: "Format de téléphone invalide (ex: +33612345678)",
    },
    message: {
      tooShort: "Le message doit contenir au moins 10 caractères",
      tooLong: "Le message ne peut pas dépasser 2000 caractères",
    },
    subject: {
      required: "Le sujet est requis",
      tooLong: "Le sujet est trop long",
    },
    decision: {
      required: "Une décision est requise",
    },
    reason: {
      tooLong: "La raison ne peut pas dépasser 500 caractères",
    },
    url: {
      invalid: "Format d'URL invalide",
    },
    search: {
      tooLong: "Recherche trop longue",
    },
    platform: {
      invalid: "Plateforme invalide",
    },
    runType: {
      invalid: "Type de run invalide",
    },
    consent: {
      required: "Vous devez accepter la politique de confidentialité",
    },
    },
  },
  en: {
    email: {
      required: "Email is required",
      invalid: "Invalid email format",
      tooLong: "Email cannot exceed 255 characters",
    },
    password: {
      tooShort: "Password must be at least 8 characters",
      tooLong: "Password cannot exceed 128 characters",
      weak: "Password must contain at least one uppercase, one lowercase and one digit",
      required: "Password is required",
      confirm: "Confirm your password",
      mismatch: "Passwords do not match",
    },
    name: {
      required: "Name is required",
      tooLong: "Name cannot exceed 100 characters",
      invalid: "Name contains invalid characters",
    },
    phone: {
      invalid: "Invalid phone format (e.g. +33612345678)",
    },
    message: {
      tooShort: "Message must be at least 10 characters",
      tooLong: "Message cannot exceed 2000 characters",
    },
    subject: {
      required: "Subject is required",
      tooLong: "Subject is too long",
    },
    decision: {
      required: "A decision is required",
    },
    reason: {
      tooLong: "Reason cannot exceed 500 characters",
    },
    url: {
      invalid: "Invalid URL format",
    },
    search: {
      tooLong: "Search query too long",
    },
    platform: {
      invalid: "Invalid platform",
    },
    runType: {
      invalid: "Invalid run type",
    },
  },
  de: {
    email: {
      required: "E-Mail ist erforderlich",
      invalid: "Ungültiges E-Mail-Format",
      tooLong: "E-Mail darf 255 Zeichen nicht überschreiten",
    },
    password: {
      tooShort: "Passwort muss mindestens 8 Zeichen lang sein",
      tooLong: "Passwort darf 128 Zeichen nicht überschreiten",
      weak: "Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Ziffer enthalten",
      required: "Passwort ist erforderlich",
      confirm: "Passwort bestätigen",
      mismatch: "Passwörter stimmen nicht überein",
    },
    name: {
      required: "Name ist erforderlich",
      tooLong: "Name darf 100 Zeichen nicht überschreiten",
      invalid: "Name enthält ungültige Zeichen",
    },
    phone: {
      invalid: "Ungültiges Telefonformat (z.B. +33612345678)",
    },
    message: {
      tooShort: "Nachricht muss mindestens 10 Zeichen lang sein",
      tooLong: "Nachricht darf 2000 Zeichen nicht überschreiten",
    },
    subject: {
      required: "Betreff ist erforderlich",
      tooLong: "Betreff ist zu lang",
    },
    decision: {
      required: "Eine Entscheidung ist erforderlich",
    },
    reason: {
      tooLong: "Begründung darf 500 Zeichen nicht überschreiten",
    },
    url: {
      invalid: "Ungültiges URL-Format",
    },
    search: {
      tooLong: "Suchbegriff zu lang",
    },
    platform: {
      invalid: "Ungültige Plattform",
    },
    runType: {
      invalid: "Ungültiger Run-Typ",
    },
  },
} as const;
