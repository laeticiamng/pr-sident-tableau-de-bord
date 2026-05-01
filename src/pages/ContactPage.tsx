import laeticiaPhoto from "@/assets/laeticia-motongane.jpg";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, MapPin, Building2, Clock, Loader2, Linkedin, ExternalLink, CalendarDays, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getContactSchema, sanitizeHtml } from "@/lib/validation";
import { COMPANY_PROFILE } from "@/lib/constants";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { useTranslation } from "@/contexts/LanguageContext";
import { contactTranslations } from "@/i18n/contact";

type ContactFormData = z.infer<ReturnType<typeof getContactSchema>>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslation(contactTranslations);

  usePageMeta({
    title: t.meta.title,
    description: t.meta.description,
    ogImageAlt: t.meta.title + " — EMOTIONSCARE",
    canonicalPath: "/contact",
  });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ContactFormData>({
    resolver: zodResolver(getContactSchema()),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "", consent: false as unknown as true },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    const sanitizedData = {
      name: sanitizeHtml(data.name),
      email: sanitizeHtml(data.email),
      phone: data.phone ? sanitizeHtml(data.phone) : undefined,
      subject: sanitizeHtml(data.subject),
      message: sanitizeHtml(data.message),
    };
    try {
      const { data, error } = await supabase.functions.invoke("contact-form", { body: sanitizedData });
      if (error) {
        logger.error("[Contact] Edge function error:", error);
        toast.error(t.form.errorSend, { description: t.form.errorSendDescription });
        return;
      }
      if (data?.error) { toast.error(data.error); return; }
      toast.success(t.form.success, { description: t.form.successDescription });
      reset();
    } catch (err) {
      logger.error("[Contact] Unexpected error:", err);
      toast.error(t.form.errorConnection, { description: t.form.errorConnectionDescription });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="py-20 md:py-28 bg-hero-gradient text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-6">{t.hero.badge}</Badge>
            <h1 className="text-headline-1 md:text-display-2 mb-6 text-white">{t.hero.title}</h1>
            <p className="text-body-lg text-white/80">{t.hero.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="card-executive p-8 md:p-10">
              <h2 className="text-2xl font-semibold mb-6">{t.form.title}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.form.name} *</Label>
                  <Input id="name" placeholder={t.form.namePlaceholder} autoComplete="name" {...register("name")} aria-invalid={!!errors.name} className={errors.name ? "border-destructive" : ""} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.form.email} *</Label>
                    <Input id="email" type="email" placeholder={t.form.emailPlaceholder} autoComplete="email" {...register("email")} aria-invalid={!!errors.email} className={errors.email ? "border-destructive" : ""} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.form.phone}</Label>
                    <Input id="phone" type="tel" placeholder={t.form.phonePlaceholder} autoComplete="tel" {...register("phone")} aria-invalid={!!errors.phone} className={errors.phone ? "border-destructive" : ""} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t.form.subject} *</Label>
                  <Input id="subject" placeholder={t.form.subjectPlaceholder} {...register("subject")} aria-invalid={!!errors.subject} className={errors.subject ? "border-destructive" : ""} />
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.form.messageLabel}</Label>
                  <Textarea id="message" placeholder={t.form.messagePlaceholder} rows={5} {...register("message")} aria-invalid={!!errors.message} className={errors.message ? "border-destructive" : ""} />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="consent" className="hidden" {...register("consent")} />
                  <Checkbox
                    id="consent-visual"
                    checked={watch("consent") as unknown as boolean}
                    onCheckedChange={(checked) => setValue("consent", checked as unknown as true, { shouldValidate: true })}
                    aria-invalid={!!errors.consent}
                  />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="consent" className="text-sm font-normal text-muted-foreground cursor-pointer">
                      {t.form.consentLabel}{" "}
                      <Link to="/legal/confidentialite" className="text-accent underline hover:no-underline">
                        {t.form.consentLink}
                      </Link> *
                    </Label>
                    {errors.consent && <p className="text-xs text-destructive">{errors.consent.message}</p>}
                  </div>
                </div>
                <Button type="submit" variant="executive" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.form.submitting}</>) : t.form.submit}
                </Button>
                <p className="text-xs text-muted-foreground text-center">{t.form.required}</p>
              </form>
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t.info.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium mb-6">
                  <Clock className="h-4 w-4" />
                  {t.info.responseTime}
                </div>
                <p className="text-muted-foreground mb-8">{t.info.description}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Building2 className="h-6 w-6" /></div>
                  <div>
                    <h3 className="font-semibold mb-1">{t.info.companyName}</h3>
                    <p className="text-muted-foreground">EMOTIONSCARE SASU</p>
                    <p className="text-sm text-muted-foreground">SIREN : 944 505 445</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><MapPin className="h-6 w-6" /></div>
                  <div>
                    <h3 className="font-semibold mb-1">{t.info.headquarters}</h3>
                    <p className="text-muted-foreground">80000 Amiens, France</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Mail className="h-6 w-6" /></div>
                  <div>
                    <h3 className="font-semibold mb-1">{t.info.email}</h3>
                    <p className="text-muted-foreground">contact@emotionscare.com</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <img src={laeticiaPhoto} alt="Motongane Laeticia — Présidente EMOTIONSCARE" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                <div>
                  <h3 className="font-semibold mb-1">{t.info.findUs}</h3>
                  <a href={COMPANY_PROFILE.linkedinPresident} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent hover:underline">
                    <span>Motongane Laeticia</span><ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a href={COMPANY_PROFILE.linkedinCompany} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-accent hover:underline text-sm mt-1">
                    <span>EMOTIONSCARE SASU</span><ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="mt-2">
                    <VerifiedPresidentBadge size="sm" tone="light" showGLN={false} />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Clock className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-semibold mb-1">{t.info.hours}</h3>
                  <p className="text-muted-foreground text-sm">{t.info.hoursDetail}<br />{t.info.hoursResponse}</p>
                </div>
              </div>

              {/* Demo scheduling */}
              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg">{t.info.demoTitle}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{t.info.demoDescription}</p>
                <ul className="space-y-2 mb-5">
                  {t.info.demoFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact?subject=Planifier%20une%20démo">
                  <Button variant="executive" size="default" className="w-full">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {t.info.demoButton}
                  </Button>
                </Link>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-border/60 h-52 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="relative z-10 text-center">
                  <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-foreground font-semibold text-lg">{t.info.mapCity}</p>
                  <p className="text-muted-foreground text-sm">49.8941° N, 2.2958° E</p>
                  <p className="text-muted-foreground text-xs mt-1">{t.info.mapRegion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
