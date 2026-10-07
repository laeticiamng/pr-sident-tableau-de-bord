# Guide de Contribution — EMOTIONSCARE HQ

> Standards de développement, workflow Git et bonnes pratiques

---

## 🎯 Philosophie

> **"Aucune extrapolation logique, uniquement les exigences explicites"**

- Prototype minimal d'abord
- 90% d'effort sur les tests
- Zéro erreur silencieuse
- Standard qualité "HEC/Polytechnique"

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 22 (comme la CI)
- Bun 1.3 (bun.lock est le seul fichier de verrouillage)
- Git
- Compte Lovable (pour le déploiement)

### Installation

```bash
# Cloner le repo
git clone https://github.com/laeticiamng/hq-emotionscare.git
cd hq-emotionscare

# Installer les dépendances (installation figée, comme la CI)
bun install --frozen-lockfile

# Lancer le serveur de dev
npm run dev
```

### Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur dev avec HMR |
| `npm run build` | Build production |
| `npm run preview` | Preview du build |
| `npm run lint` | ESLint |
| `npm run test` | Tests Vitest |
| `npm run test:coverage` | Tests avec couverture |

---

## 📁 Structure du projet

```
src/
├── components/
│   ├── auth/           # Guards d'authentification
│   ├── hq/             # Widgets du HQ (CommandPalette, etc.)
│   ├── layout/         # Layouts (HQLayout, PublicLayout)
│   └── ui/             # shadcn/ui components
├── hooks/
│   ├── useAuth.ts      # Authentification
│   ├── usePermissions.ts # RBAC
│   ├── useHQData.ts    # Données HQ
│   └── use*.ts         # Autres hooks
├── lib/
│   ├── constants.ts    # Constantes
│   ├── validation.ts   # Schemas Zod
│   └── utils.ts        # Utilitaires
├── pages/
│   ├── hq/             # Pages HQ
│   └── legal/          # Pages légales
├── test/
│   ├── setup.ts        # Configuration Vitest
│   └── *.test.ts       # Tests
└── integrations/
    └── supabase/       # Client Supabase (auto-généré)

supabase/
├── functions/          # Edge Functions
│   ├── executive-run/
│   ├── stripe-kpis/
│   └── ...
├── migrations/         # Migrations SQL (auto-générées)
└── config.toml         # Configuration Supabase

docs/
├── API_REFERENCE.md    # Documentation API
├── AI_GUIDE.md         # Guide IA
├── DATABASE_SCHEMA.md  # Schémas DB
├── MODULES_GUIDE.md    # Guide des modules
├── USER_STORIES.md     # User stories
└── CONTRIBUTING.md     # Ce fichier
```

---

## 🔀 Workflow Git

### Branches

| Branche | Usage |
|---------|-------|
| `main` | Production stable |
| `feature/*` | Nouvelles fonctionnalités |
| `fix/*` | Corrections de bugs |
| `docs/*` | Documentation |

### Convention de commits

Format: `type(scope): description`

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactorisation |
| `test` | Ajout/modification de tests |
| `chore` | Maintenance |

**Exemples**:
```
feat(hq): add CommandPalette keyboard shortcuts
fix(auth): handle session expiration gracefully
docs(api): document stripe-kpis endpoint
test(hooks): add usePermissions unit tests
```

### Workflow de contribution

```bash
# 1. Créer une branche
git checkout -b feature/ma-feature

# 2. Développer et commiter
git add .
git commit -m "feat(scope): description"

# 3. Pousser et créer une PR
git push origin feature/ma-feature
```

### Tags de stabilité

Après chaque série de modifications validées:
```bash
git tag STABLE-1.0
git push origin STABLE-1.0
```

---

## 🧪 Tests

### Structure des tests

```
src/test/
├── setup.ts              # Configuration globale
├── example.test.ts       # Test minimal
├── hooks/
│   ├── useAuth.test.ts
│   ├── usePermissions.test.ts
│   └── useStripeKPIs.test.ts
├── components/
│   ├── CommandPalette.test.tsx
│   └── ExecutiveCockpit.test.tsx
└── edge-functions/
    ├── executive-run.test.ts
    └── stripe-kpis.test.ts
```

### Écrire un test

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole("button"));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Mocks Supabase

```typescript
import { vi } from "vitest";

// Mock du client Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ data: [], error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));
```

### Exécuter les tests

```bash
# Tous les tests
npm run test

# Avec couverture
npm run test:coverage

# Un fichier spécifique
npm run test -- src/test/hooks/useAuth.test.ts

# Mode watch
npm run test -- --watch
```

---

## 📏 Standards de code

### TypeScript

```typescript
// ✅ Bon: Types explicites
interface UserProps {
  id: string;
  name: string;
  role: AppRole;
}

// ❌ Mauvais: any
const user: any = {};
```

### React

```typescript
// ✅ Bon: Composants fonctionnels avec hooks
export function MyComponent({ data }: Props) {
  const [state, setState] = useState(initial);
  
  return <div>{/* ... */}</div>;
}

// ❌ Mauvais: Class components
class MyComponent extends React.Component {}
```

### Styling

```tsx
// ✅ Bon: Tokens sémantiques
<div className="bg-background text-foreground">
<Badge variant="gold">

// ❌ Mauvais: Couleurs directes
<div className="bg-white text-black">
<div style={{ backgroundColor: "#fff" }}>
```

### Hooks

```typescript
// ✅ Bon: Hooks customs réutilisables
export function useMyData() {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: fetchMyData,
  });
}

// ❌ Mauvais: Logique dans les composants
function MyComponent() {
  const [data, setData] = useState([]);
  useEffect(() => { /* fetch logic */ }, []);
}
```

---

## 🔐 Sécurité

### Secrets

- **Jamais** de secrets dans le code
- Utiliser les secrets Supabase/Cloud
- Les clés publiques (VITE_*) sont OK

### Validation

```typescript
// ✅ Validation Zod pour tous les formulaires
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

// ✅ Sanitization avant stockage
import DOMPurify from "dompurify";
const clean = DOMPurify.sanitize(userInput);
```

### RLS

- Toute nouvelle table doit avoir RLS activé
- Documenter les policies dans la PR
- Tester les accès avec différents rôles

---

## 📝 Documentation

### Docstrings

```typescript
/**
 * Récupère les permissions d'un utilisateur.
 * 
 * @param userId - ID de l'utilisateur
 * @returns Liste des permissions {resource, action}
 * 
 * @example
 * const perms = await getUserPermissions("user-123");
 * // => [{ resource: "finance", action: "view" }]
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  // ...
}
```

### README des modules

Chaque nouveau module HQ doit avoir une section dans `docs/MODULES_GUIDE.md`.

---

## 🚦 CI/CD

### Pipeline automatique

Le fichier `.github/workflows/ci.yml` exécute à chaque push/PR:

1. **Lint**: ESLint
2. **TypeCheck**: `tsc --noEmit`
3. **Tests**: Vitest avec couverture
4. **Build**: Vérification de la compilation

### Badges

[![CI](https://github.com/laeticiamng/hq-emotionscare/actions/workflows/ci.yml/badge.svg)](https://github.com/laeticiamng/hq-emotionscare/actions)

### Déploiement

Le déploiement se fait via Lovable:
1. Ouvrir le projet dans Lovable
2. Vérifier les changements dans le preview
3. Cliquer "Share → Publish"

---

## 📋 Checklist PR

Avant de soumettre une PR:

- [ ] Tests ajoutés/mis à jour
- [ ] Lint passe (`npm run lint`)
- [ ] Build passe (`npm run build`)
- [ ] Documentation mise à jour si nécessaire
- [ ] Commit message respecte la convention
- [ ] Pas de secrets dans le code
- [ ] RLS policies documentées (si tables modifiées)

---

## 🆘 Troubleshooting

### Erreur TypeScript sur les types Supabase

Les types sont auto-générés. Ne pas les modifier manuellement.
```bash
# Le fichier sera régénéré après une migration
src/integrations/supabase/types.ts
```

### Tests qui échouent

```bash
# Vérifier la configuration
cat vitest.config.ts

# Exécuter en mode verbose
npm run test -- --reporter=verbose
```

### Edge Function timeout

- Vérifier les logs: Lovable Cloud > Logs
- Ajouter plus de logging
- Simplifier les appels externes

---

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/laeticiamng/hq-emotionscare/issues)
- **Présidente**: m.laeticia@hotmail.fr

---

*Dernière mise à jour: 03/02/2026 — v1.0*
