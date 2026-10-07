import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Language } from "@/i18n/types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("preferred-lang");
    if (stored === "en" || stored === "de" || stored === "fr") return stored;
    return "fr";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred-lang", lang);
  }, []);

  // Correctif : <html lang> n'était mis à jour qu'au changement explicite de langue.
  // Un visiteur revenant avec « en » ou « de » mémorisé voyait le contenu traduit
  // sous <html lang="fr"> (lecteurs d'écran, SEO, et messages de src/lib/validation.ts
  // qui lisent cet attribut). On synchronise l'attribut sur la langue active, y compris au démarrage.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useTranslation<T extends Record<Language, unknown>>(translations: T): T[Language] {
  const { language } = useLanguage();
  return translations[language] as T[Language];
}
