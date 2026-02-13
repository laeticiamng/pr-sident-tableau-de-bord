import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Remonter en haut de page à chaque changement de route
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
