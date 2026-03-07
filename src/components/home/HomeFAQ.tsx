import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/contexts/LanguageContext";
import { homeFaqTranslations } from "@/i18n/home-faq";

export function HomeFAQ() {
  const t = useTranslation(homeFaqTranslations);

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">
              {t.label}
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              {t.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {t.items.map((item, index) => (
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
  );
}
