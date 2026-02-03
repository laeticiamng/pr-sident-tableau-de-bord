import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, Shield, Sparkles, Lock, Mail } from "lucide-react";
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(220_25%_20%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(220_25%_20%/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl">
                  <Building2 className="h-10 w-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {mode === "login" ? "Espace Président" : "Créer un compte"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode === "login"
                ? "Accédez au siège social numérique"
                : "Inscrivez-vous pour accéder au HQ"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="president@emotionscare.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="executive"
              size="lg"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {mode === "login" ? "Connexion..." : "Création..."}
                </>
              ) : mode === "login" ? (
                "Se connecter"
              ) : (
                "Créer le compte"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              {mode === "login"
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="p-1.5 rounded-full bg-success/10">
              <Shield className="h-3 w-3 text-success" />
            </div>
            Connexion sécurisée et chiffrée
          </div>
        </div>
      </div>

      {/* Right Panel - Premium Branding */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(38_92%_50%/0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_50%,hsl(222_47%_20%/0.5),transparent)]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(220_25%_20%/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(220_25%_20%/0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative z-10 max-w-lg text-center text-primary-foreground">
          <div className="mb-8 animate-fade-in">
            <Badge variant="gold" className="px-4 py-2 text-sm glow-gold">
              <Sparkles className="h-4 w-4 mr-2" />
              Siège Social Numérique
            </Badge>
          </div>
          
          <h2 className="text-5xl font-bold mb-4 animate-slide-up tracking-tight">
            EMOTIONSCARE
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="text-3xl font-light text-accent tracking-[0.3em]">SASU</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent/50" />
          </div>
          
          <p className="text-xl text-primary-foreground/70 mb-12 animate-slide-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Votre cockpit exécutif pour piloter les 5 plateformes de l'entreprise avec une précision chirurgicale.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-4xl font-bold text-accent mb-2">5</div>
              <div className="text-sm text-primary-foreground/60">Plateformes</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-4xl font-bold text-accent mb-2">21</div>
              <div className="text-sm text-primary-foreground/60">Agents IA</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-4xl font-bold text-accent mb-2">∞</div>
              <div className="text-sm text-primary-foreground/60">Ambition</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
