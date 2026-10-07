import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Le projet a choisi un typage souple (tsconfig : strict false, noImplicitAny false) ;
      // les ~70 `any` explicites (surtout dans les fonctions Edge Deno) restent signalés en
      // avertissement pour être résorbés progressivement, sans bloquer la CI. Toutes les
      // autres règles (dont react-hooks/rules-of-hooks) restent bloquantes.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
