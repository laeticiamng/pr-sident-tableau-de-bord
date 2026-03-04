import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
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
    document.documentElement.lang = lang;
  }, []);

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
