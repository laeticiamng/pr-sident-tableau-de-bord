import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// Fallback constants for Lovable Cloud (Supabase) — publishable values only.
// Le fichier .env (généré par Lovable Cloud) est listé dans .gitignore et donc
// absent du build publié, ce qui produit "supabaseUrl is required" et un
// écran noir en production. On injecte ici les mêmes valeurs en dur, qui sont
// publiques par conception (URL + clé anon publishable). Toute donnée reste
// protégée par les RLS Supabase.
const SUPABASE_URL_FALLBACK = "https://hjoylhxakijxpihwrqny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqb3lsaHhha2lqeHBpaHdycW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMDczNDcsImV4cCI6MjA4NTY4MzM0N30.cwEcWxi3zsFX9182t_2oufUYxNsVA-Z1OEFJbt5VHYM";
const SUPABASE_PROJECT_ID_FALLBACK = "hjoylhxakijxpihwrqny";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  // Filet de sécurité production uniquement.
  // En dev, on laisse Vite lire `.env` normalement (les variables existent
  // localement). En production, si le build n'a pas accès à `.env` (cas du
  // build de publication Lovable, où `.env` est gitignore), on injecte les
  // valeurs publiques pour éviter un écran noir « supabaseUrl is required ».
  // Ces valeurs sont strictement publiques (URL + clé anon) et toute donnée
  // reste protégée par les RLS Supabase.
  define:
    mode === "production"
      ? {
          ...(!process.env.VITE_SUPABASE_URL && {
            "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL_FALLBACK),
            "import.meta.env.__SUPABASE_URL_FROM_FALLBACK__": JSON.stringify(true),
          }),
          ...(!process.env.VITE_SUPABASE_PUBLISHABLE_KEY && {
            "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
              SUPABASE_PUBLISHABLE_KEY_FALLBACK,
            ),
            "import.meta.env.__SUPABASE_KEY_FROM_FALLBACK__": JSON.stringify(true),
          }),
          ...(!process.env.VITE_SUPABASE_PROJECT_ID && {
            "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
              SUPABASE_PROJECT_ID_FALLBACK,
            ),
          }),
        }
      : {},
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      filename: "ec-pwa-sw.js",
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
      },
      includeAssets: ["favicon.ico", "pwa-icon-192.png", "pwa-icon-512.png"],
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/~oauth/, /^\/sw\.js$/, /^\/service-worker\.js$/],
        importScripts: ["/sw-push.js"],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        globIgnores: ["**/sw.js", "**/service-worker.js"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "html", networkTimeoutSeconds: 3 },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "supabase-api", expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
          },
        ],
      },
      manifest: {
        name: "EMOTIONSCARE HQ — Siège Social Numérique",
        short_name: "HQ",
        description: "Pilotez vos plateformes depuis votre téléphone en 30 secondes.",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/hq",
        categories: ["business", "productivity"],
        icons: [
          { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          "radix-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-popover",
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
