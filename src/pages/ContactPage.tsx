import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulated submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Message envoyé !", {
      description: "Nous vous répondrons dans les meilleurs délais.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-6">
              Contact
            </Badge>
            <h1 className="text-headline-1 md:text-display-2 mb-6">
              Prenons contact
            </h1>
            <p className="text-body-lg text-muted-foreground">
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    placeholder="Objet de votre message"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre demande..."
                    rows={5}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="executive"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
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

              {/* Map Placeholder */}
              <div className="mt-4 rounded-xl bg-secondary/50 h-48 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  📍 Amiens, Hauts-de-France
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
