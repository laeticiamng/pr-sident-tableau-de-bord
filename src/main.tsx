import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SupabaseBootGuard } from "@/components/SupabaseBootGuard";
import { collectBootDiagnostics, logBootIssues } from "@/lib/supabaseBoot";

// Log boot issues le plus tôt possible — avant même le render React.
try {
  logBootIssues(collectBootDiagnostics());
} catch {
  // noop : le diagnostic ne doit jamais bloquer le boot.
}

if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    const reloadKey = "vite-preload-reloaded";

    try {
      if (sessionStorage.getItem(reloadKey)) return;
      sessionStorage.setItem(reloadKey, "1");
    } catch {
      // noop: continue with reload fallback
    }

    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SupabaseBootGuard>
      <App />
    </SupabaseBootGuard>
  </StrictMode>
);
