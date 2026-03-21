import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, CreditCard, Users, HelpCircle, Shield, Lock, Flag } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "@/contexts/LanguageContext";
import { pricingTranslations } from "@/i18n/pricing";
import { cn } from "@/lib/utils";

function applyAnnualDiscount(price: string): string {
  return price.replace(/(\d+(?:[.,]\d+)?)\s*€/g, (_, num) => {
    const val = parseFloat(num.replace(",", "."));
    const annual = Math.round(val * 0.8 * 100) / 100;
    const formatted = annual % 1 === 0 ? String(annual) : annual.toFixed(2).replace(".", ",");
    return `${formatted} €`;
  });
}

export default function TarifsPage() {
  const t = useTranslation(pricingTranslations);
  const [isAnnual, setIsAnnual] = useState(false);

  usePageMeta({
    title: t.title,
    description: t.subtitle,
    canonicalPath: "/tarifs",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: t.title + " — EMOTIONSCARE",
        url: "https://president-cockpit-hq.lovable.app/tarifs",
        description: t.subtitle,
        isPartOf: {
          "@type": "WebSite",
          url: "https://president-cockpit-hq.lovable.app",
          name: "EMOTIONSCARE",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://president-cockpit-hq.lovable.app/" },
            { "@type": "ListItem", position: 2, name: t.title, item: "https://president-cockpit-hq.lovable.app/tarifs" },
          ],
        },
      },
    ],
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-subtle-gradient">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-4 gap-2">
              <CreditCard className="h-3 w-3" />
              {t.badge}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-lg text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Billing toggle */}
      <section className="py-8">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>{t.billingMonthly}</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                isAnnual ? "bg-accent" : "bg-border"
              )}
              aria-label="Toggle annual billing"
            >
              <span className={cn(
                "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                isAnnual ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
            <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>{t.billingAnnual}</span>
            {isAnnual && (
              <Badge variant="gold" className="text-xs">{t.annualSave}</Badge>
            )}
          </div>
        </div>
      </section>

      {/* En bref */}
      <section className="py-12 md:py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg">{t.summary.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t.summary.text}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tableau des audiences */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              {t.whoIsItFor.title}
            </h2>
            <div className="grid gap-4">
              {t.whoIsItFor.items.map((item, index) => (
                <Card key={index} className="border-border/60">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.audience}</p>
                        <p className="text-sm text-muted-foreground">{item.platform}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1">
                        <span className="text-sm font-semibold text-accent">
                          {isAnnual ? applyAnnualDiscount((item as any).price) : (item as any).price}
                        </span>
                        <Badge variant="outline" className="w-fit text-xs">
                          {item.model}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Tarifs */}
      <section className="py-12 md:py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8 flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-primary" />
              {t.faq.title}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {t.faq.items.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-8 bg-secondary/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-success" />
              <span>RGPD</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-success" />
              <span>AES-256</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flag className="h-4 w-4 text-accent" />
              <span>Made in France</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-hero-gradient text-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.cta.title}</h2>
            <p className="text-lg text-white/80 mb-8">{t.cta.text}</p>
            <Link to="/contact">
              <Button variant="hero" size="lg" className="group">
                {t.cta.button}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
