

# Plan: Complete all remaining gaps

## Issues identified

1. **Auth & Reset pages use static FR-only Zod schemas** — `loginSchema` and `passwordSchema` show French error messages regardless of language. Need to switch to `getLoginSchema()` and `getPasswordSchema()`.

2. **ContactPage uses static FR-only `contactSchema`** — Same issue. Need to switch to `getContactSchema()`.

3. **Missing `canonicalPath` on 5 pages** — VisionPage, TrustPage, StatusPage, PlateformesPage, ContactPage all omit `canonicalPath`, meaning canonical URLs default to `window.location.pathname` which works but is less explicit. Adding explicit paths improves SEO robustness.

4. **Footer missing `/tarifs` link** — The pricing page was added to the header nav but not to the footer navigation section.

5. **ResetPassword page missing LanguageSwitcher** — Auth page has it, Reset doesn't. Inconsistent.

6. **Footer "Siège social numérique"** — Internal jargon in footer description (FR). Should align with public-facing copy.

## Implementation plan

### 1. Switch AuthPage to dynamic i18n validation
- **File**: `src/pages/AuthPage.tsx`
- Replace `import { loginSchema }` with `import { getLoginSchema }`
- Call `const validationResult = getLoginSchema().safeParse(...)` inside handler

### 2. Switch ResetPasswordPage to dynamic i18n validation + add LanguageSwitcher
- **File**: `src/pages/ResetPasswordPage.tsx`
- Replace `import { passwordSchema }` with `import { getPasswordSchema }`
- Call `getPasswordSchema().safeParse(password)` inside handler
- Add `<LanguageSwitcher />` in top-right corner (same pattern as AuthPage)

### 3. Switch ContactPage to dynamic i18n validation
- **File**: `src/pages/ContactPage.tsx`
- Replace static `contactSchema` with dynamic `getContactSchema()`
- The `zodResolver` must call `getContactSchema()` at form instantiation time
- Type extraction needs adjustment: use `z.infer<ReturnType<typeof getContactSchema>>`

### 4. Add `canonicalPath` to 5 pages
- `PlateformesPage.tsx`: add `canonicalPath: "/plateformes"`
- `VisionPage.tsx`: add `canonicalPath: "/vision"`
- `TrustPage.tsx`: add `canonicalPath: "/trust"`
- `StatusPage.tsx`: add `canonicalPath: "/status"`
- `ContactPage.tsx`: add `canonicalPath: "/contact"`

### 5. Add `/tarifs` to footer navigation
- **File**: `src/components/layout/PublicFooter.tsx`
- Add a `<li>` for Tarifs/Pricing/Preise link after platforms
- Add translation key `pricing` to footer nav in `src/i18n/common.ts` (already exists in `nav` section, reuse it)

### 6. Fix footer description jargon
- **File**: `src/i18n/common.ts`
- FR: "Siège social numérique pilotant 8 plateformes" → "Éditeur français de 8 plateformes SaaS innovantes. Basé à Amiens."
- EN/DE: also tighten to match

### Files modified (8 files)
- `src/pages/AuthPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/PlateformesPage.tsx`
- `src/pages/VisionPage.tsx`
- `src/pages/TrustPage.tsx`
- `src/pages/StatusPage.tsx`
- `src/components/layout/PublicFooter.tsx`
- `src/i18n/common.ts`

