import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Identifiants incorrects");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          toast.success("Bienvenue, Madame la Présidente");
          navigate("/hq");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/hq`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Cet email est déjà enregistré");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          toast.success("Compte créé !", {
            description: "Vérifiez votre email pour confirmer votre inscription.",
          });
        }
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Building2 className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {mode === "login" ? "Espace Président" : "Créer un compte"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Accédez au siège social numérique"
                : "Inscrivez-vous pour accéder au HQ"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="president@emotionscare.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="executive"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "login" ? "Connexion..." : "Création..."}
                </>
              ) : mode === "login" ? (
                "Se connecter"
              ) : (
                "Créer le compte"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "login"
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            Connexion sécurisée
          </div>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient text-primary-foreground items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Badge variant="gold" className="mb-6">
            Siège Social Numérique
          </Badge>
          <h2 className="text-3xl font-bold mb-6">
            EMOTIONSCARE
            <span className="block text-accent">SASU</span>
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Votre cockpit exécutif pour piloter les 5 plateformes de l'entreprise.
            Prenez des décisions informées, rapidement.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-accent">5</div>
              <div className="text-sm text-primary-foreground/60">Plateformes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">1</div>
              <div className="text-sm text-primary-foreground/60">Siège</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">∞</div>
              <div className="text-sm text-primary-foreground/60">Ambition</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
