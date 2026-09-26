import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

/**
 * Page institutionnelle MNG : quatre produits, une signature.
 * Règle éditoriale MNG : une phrase suffit quand une phrase suffit.
 */
const PRODUCTS = [
  {
    name: "Emotions Care",
    by: true,
    line: "Comprendre ce que vous ressentez, et savoir quoi en faire.",
    audience: "Pour les soignants et les étudiants en santé",
    href: "https://emotionscare.com",
    host: "emotionscare.com",
  },
  {
    name: "Med MNG",
    by: false,
    line: "Les 367 items de l’EDN, en fiches, en chansons et en quiz.",
    audience: "Pour les étudiants en médecine",
    href: "https://medmng.com",
    host: "medmng.com",
  },
  {
    name: "Memo MNG",
    by: false,
    line: "Ton cours devient une chanson, un escape game et des révisions espacées.",
    audience: "Pour les étudiants et ceux qui apprennent",
    href: "https://memomng.com",
    host: "memomng.com",
  },
  {
    name: "MedCopilote Suisse",
    by: true,
    line: "Ton parcours médical suisse, dans le bon ordre.",
    audience: "Pour les médecins qui arrivent ou se forment en Suisse",
    href: "https://medcopilote-suisse.vercel.app",
    host: "medcopilote-suisse.vercel.app",
  },
] as const;

export default function HomePage() {
  usePageMeta({
    title: "MNG — des outils pour rendre les choses complexes plus simples",
    description: "Emotions Care, Med MNG, Memo MNG et MedCopilote Suisse : quatre produits conçus par une médecin, édités par EmotionsCare SASU.",
    canonicalPath: "/",
  });

  return (
    <div className="flex flex-col">
      <section className="container px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">MNG</p>
        <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          Des outils conçus pour rendre les choses complexes plus simples.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Quatre produits, pensés par une médecin, pour la santé, l’apprentissage et les carrières médicales.
        </p>
      </section>

      <section className="container px-4 sm:px-6 lg:px-8 pb-20" aria-label="Produits">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <li key={p.name} className="bg-background">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col p-7 sm:p-9 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">{p.name}</h2>
                    {p.by && <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">by MNG</p>}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </div>
                <p className="mt-6 text-lg leading-snug">{p.line}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.audience}</p>
                <p className="mt-auto pt-8 text-xs text-muted-foreground">{p.host}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="container px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-2xl border-t border-border pt-10">
          <p className="text-lg">MNG vient de Moto-Ngane.</p>
          <p className="mt-1 text-lg text-muted-foreground">Une signature devenue une famille de produits.</p>
          <p className="mt-8 text-sm text-muted-foreground">
            Conçu par MNG · Édité par EmotionsCare SASU ·{" "}
            <Link to="/contact" className="underline underline-offset-4 hover:text-foreground">Contact</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
