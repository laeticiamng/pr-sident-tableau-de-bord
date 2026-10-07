import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

function SondeLangue() {
  const { language, setLanguage } = useLanguage();
  return (
    <button type="button" onClick={() => setLanguage("de")}>
      langue:{language}
    </button>
  );
}

describe("LanguageProvider — attribut <html lang>", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "fr";
  });

  it("applique dès le démarrage la langue mémorisée à <html lang>", () => {
    localStorage.setItem("preferred-lang", "en");
    render(
      <LanguageProvider>
        <SondeLangue />
      </LanguageProvider>,
    );
    expect(screen.getByRole("button")).toHaveTextContent("langue:en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("met à jour <html lang> et la préférence lors d'un changement de langue", () => {
    render(
      <LanguageProvider>
        <SondeLangue />
      </LanguageProvider>,
    );
    expect(document.documentElement.lang).toBe("fr");
    act(() => {
      screen.getByRole("button").click();
    });
    expect(document.documentElement.lang).toBe("de");
    expect(localStorage.getItem("preferred-lang")).toBe("de");
  });
});
