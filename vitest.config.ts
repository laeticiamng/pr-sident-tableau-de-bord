import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Le client Supabase est créé au chargement du module (src/integrations/supabase/client.ts)
    // et exige une URL : sans .env (CI, worktree propre) tout test qui importe un hook
    // échouait avec « supabaseUrl is required ». Valeurs factices locales : aucun test
    // ne doit joindre un vrai projet Supabase.
    env: {
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: "cle-publique-factice-pour-tests",
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
