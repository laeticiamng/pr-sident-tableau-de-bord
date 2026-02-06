import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Building2, Clock, Loader2, Linkedin, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, sanitizeHtml } from "@/lib/validation";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEO: Update document meta for this page
  useEffect(() => {
    document.title = "Contact — EMOTIONSCARE SASU";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Contactez EMOTIONSCARE SASU à Amiens. Questions, projets, partenariats — nous répondons sous 24-48h. SIREN 944 505 445.");
    }
    return () => {
      document.title = "EMOTIONSCARE SASU — Siège Social Numérique";
      if (metaDescription) {
        metaDescription.setAttribute("content", "Éditeur de logiciels applicatifs français. 5 plateformes innovantes pilotées depuis notre siège numérique.");
      }
    };
  }, []);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Sanitize all inputs before processing
    const sanitizedData = {
      name: sanitizeHtml(data.name),
      email: sanitizeHtml(data.email),
      phone: data.phone ? sanitizeHtml(data.phone) : undefined,
      subject: sanitizeHtml(data.subject),
      message: sanitizeHtml(data.message),
    };
    
    try {
      const { data, error } = await supabase.functions.invoke("contact-form", {
        body: sanitizedData,
      });

      if (error) {
        console.error("[Contact] Edge function error:", error);
        toast.error("Erreur lors de l'envoi", {
          description: "Veuillez réessayer ou nous contacter directement par email.",
        });
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Message envoyé avec succès !", {
        description: "Nous vous répondrons sous 24 à 48 heures ouvrées.",
      });
      reset();
    } catch (err) {
      console.error("[Contact] Unexpected error:", err);
      toast.error("Erreur de connexion", {
        description: "Vérifiez votre connexion internet et réessayez.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-hero-gradient text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-6">
              Contact
            </Badge>
            <h1 className="text-headline-1 md:text-display-2 mb-6 text-white">
              Prenons contact
            </h1>
            <p className="text-body-lg text-white/80">
              Une question, un projet, une idée ? Nous sommes à votre écoute.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="card-executive p-8 md:p-10">
              <h2 className="text-2xl font-semibold mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom complet"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      {...register("phone")}
                      aria-invalid={!!errors.phone}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    placeholder="Objet de votre message"
                    {...register("subject")}
                    aria-invalid={!!errors.subject}
                    className={errors.subject ? "border-destructive" : ""}
                  />
                  {errors.subject && (
                    <p className="text-xs text-destructive">{errors.subject.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message * (min. 10 caractères)</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre demande en détail..."
                    rows={5}
                    {...register("message")}
                    aria-invalid={!!errors.message}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="executive"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le message"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  * Champs obligatoires. Vos données sont traitées conformément à notre politique de confidentialité.
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Nos coordonnées</h2>
                <p className="text-muted-foreground mb-8">
                  N'hésitez pas à nous contacter directement. Nous répondons 
                  généralement sous 24 à 48 heures ouvrées.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Raison sociale</h3>
                    <p className="text-muted-foreground">EMOTIONSCARE SASU</p>
                    <p className="text-sm text-muted-foreground">SIREN : 944 505 445</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Siège social</h3>
                    <p className="text-muted-foreground">
                      Appartement 1, 5 Rue Caudron
                      <br />
                      80000 Amiens, France
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">contact@emotionscare.fr</p>
                  </div>
                </div>
              </div>

              {/* Liens LinkedIn */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Linkedin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Retrouvez-nous</h3>
                  <a
                    href="https://www.linkedin.com/in/laeticia-motongane/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-accent hover:underline"
                  >
                    <span>Laeticia Motongane</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/emotionscare/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-accent hover:underline text-sm mt-1"
                  >
                    <span>EMOTIONSCARE SASU</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Horaires d'ouverture */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horaires</h3>
                  <p className="text-muted-foreground text-sm">
                    Lun - Ven : 9h00 - 18h00
                    <br />
                    Réponse sous 24-48h ouvrées
                  </p>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-4 rounded-xl bg-gradient-to-br from-accent/5 to-transparent border h-48 flex flex-col items-center justify-center">
                <div className="text-4xl mb-2">📍</div>
                <p className="text-foreground font-medium">Amiens, Hauts-de-France</p>
                <p className="text-muted-foreground text-sm">Préfecture de la Somme</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
