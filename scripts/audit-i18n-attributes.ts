/**
 * Audit script: detect hardcoded (non-i18n) human-readable strings in
 * `aria-label`, `placeholder`, `alt`, and `title` attributes inside
 * the public surface of the app (pages + layout components used publicly).
 *
 * A value is considered i18n-bound if it is a JSX expression `{...}` —
 * typically a translation key like `{t.something}`. A value is considered
 * a hardcoded literal if it uses double or single quotes, e.g.
 * `aria-label="Ouvrir le menu"`.
 *
 * Usage:
 *   npx tsx scripts/audit-i18n-attributes.ts
 * Exit code: 0 = clean, 1 = hardcoded literals found.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PUBLIC_PAGES = [
  "src/pages/HomePage.tsx",
  "src/pages/PlateformesPage.tsx",
  "src/pages/VisionPage.tsx",
  "src/pages/ContactPage.tsx",
  "src/pages/TrustPage.tsx",
  "src/pages/TarifsPage.tsx",
  "src/pages/StatusPage.tsx",
  "src/pages/NotFound.tsx",
];
const PUBLIC_LAYOUT_DIRS = ["src/components/layout", "src/components"];
const PUBLIC_LAYOUT_FILES = [
  "src/components/layout/PublicHeader.tsx",
  "src/components/layout/PublicFooter.tsx",
  "src/components/layout/PublicLayout.tsx",
  "src/components/LanguageSwitcher.tsx",
  "src/components/HeroVerifiedSlot.tsx",
  "src/components/VerifiedPresidentBadge.tsx",
  "src/components/PresidentCredentials.tsx",
];

const ATTRS = ["aria-label", "placeholder", "alt", "title"];
// Allow these literal values (non-translatable: brand names, ids, empty, single chars).
const ALLOW_LITERAL = new Set([
  "",
  "EMOTIONSCARE",
  "MedReg",
  "GLN",
  "Stripe",
  "Supabase",
  "GitHub",
  "EmotionsCare",
]);

type Finding = { file: string; line: number; attr: string; value: string };

function collectFiles(): string[] {
  const set = new Set<string>();
  for (const f of PUBLIC_PAGES) set.add(f);
  for (const f of PUBLIC_LAYOUT_FILES) set.add(f);
  return [...set].filter((f) => {
    try {
      return statSync(join(ROOT, f)).isFile();
    } catch {
      return false;
    }
  });
}

function isAcceptableLiteral(value: string): boolean {
  const v = value.trim();
  if (ALLOW_LITERAL.has(v)) return true;
  // single character / pure punctuation / numbers
  if (v.length <= 1) return true;
  if (/^[\s\p{P}\p{S}\d]+$/u.test(v)) return true;
  return false;
}

function scanFile(rel: string): Finding[] {
  const abs = join(ROOT, rel);
  const src = readFileSync(abs, "utf8");
  const findings: Finding[] = [];
  const lines = src.split("\n");
  // match: attr="literal" or attr='literal' (NOT attr={...})
  const re = new RegExp(
    `\\b(${ATTRS.join("|")})\\s*=\\s*("([^"]*)"|'([^']*)')`,
    "g",
  );
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(line)) !== null) {
      const attr = m[1];
      const value = m[3] ?? m[4] ?? "";
      if (isAcceptableLiteral(value)) continue;
      findings.push({ file: rel, line: i + 1, attr, value });
    }
  }
  return findings;
}

function main() {
  const files = collectFiles();
  const all: Finding[] = [];
  for (const f of files) all.push(...scanFile(f));
  if (all.length === 0) {
    console.log(`✅ i18n attribute audit clean (${files.length} files scanned).`);
    process.exit(0);
  }
  console.error(
    `❌ Found ${all.length} hardcoded literal attribute(s) on public surface:`,
  );
  for (const f of all) {
    console.error(`  ${f.file}:${f.line}  ${f.attr}="${f.value}"`);
  }
  console.error(
    "\nFix: replace literal values with i18n-bound expressions, e.g. aria-label={t.section.ariaLabel}.",
  );
  process.exit(1);
}

main();