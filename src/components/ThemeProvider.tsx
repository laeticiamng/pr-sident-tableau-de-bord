import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
  monochrome: boolean;
  setMonochrome: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "hq-theme";
const MONO_KEY = "hq-monochrome";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(THEME_KEY) as Theme) || "system";
}

function getStoredMono(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MONO_KEY) === "true";
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return getStoredTheme();
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const stored = getStoredTheme();
    return stored === "system" ? getSystemTheme() : stored;
  });

  const [monochrome, setMonochromeState] = useState<boolean>(getStoredMono);

  const applyTheme = useCallback((newTheme: Theme, mono?: boolean) => {
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);

    const root = document.documentElement;
    
    root.classList.add("theme-transition");
    
    root.classList.remove("light", "dark");
    root.classList.add(resolved);

    // Monochrome
    const isMono = mono ?? monochrome;
    if (isMono) {
      root.classList.add("monochrome");
    } else {
      root.classList.remove("monochrome");
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolved === "dark" ? "#0a0a0a" : "#ffffff"
      );
    }
    
    setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 400);
  }, [monochrome]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  const setMonochrome = useCallback((v: boolean) => {
    setMonochromeState(v);
    localStorage.setItem(MONO_KEY, String(v));
    applyTheme(theme, v);
  }, [applyTheme, theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    monochrome,
    setMonochrome,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Initialize theme immediately to prevent flash
if (typeof window !== "undefined") {
  const stored = getStoredTheme();
  const resolved = stored === "system" ? getSystemTheme() : stored;
  document.documentElement.classList.add(resolved);
  if (getStoredMono()) {
    document.documentElement.classList.add("monochrome");
  }
}
