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
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden relative z-10 bg-hero-gradient py-8 px-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-foreground/20 to-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
              <Sparkles className="h-2.5 w-2.5" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-primary-foreground mb-1">EMOTIONSCARE</h2>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent/50" />
          <span className="text-lg font-light text-accent tracking-[0.2em]">SASU</span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent/50" />
        </div>
      </div>
      
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Logo - Desktop only */}
          <div className="hidden lg:block text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl">
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Espace Président</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Accédez au siège social numérique
            </p>
          </div>

          {/* Mobile Title */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Espace Président</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Accédez au siège social numérique
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                  autoComplete="email"
                  className="pl-10 h-11 sm:h-12 text-base"
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
                  autoComplete="current-password"
                  className="pl-10 h-11 sm:h-12 text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="executive"
              size="lg"
              className="w-full h-11 sm:h-12 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="p-1.5 rounded-full bg-success/10">
              <Shield className="h-3 w-3 text-success" />
            </div>
            Connexion sécurisée et chiffrée
          </div>
        </div>
      </div>

      {/* Right Panel - Premium Branding (Desktop only) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-8 xl:p-12 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--accent)/0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_50%,hsl(var(--primary)/0.3),transparent)]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-48 xl:w-64 h-48 xl:h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-36 xl:w-48 h-36 xl:h-48 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative z-10 max-w-md xl:max-w-lg text-center text-primary-foreground">
          <div className="mb-6 xl:mb-8 animate-fade-in">
            <Badge variant="gold" className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm glow-gold">
              <Sparkles className="h-3 w-3 xl:h-4 xl:w-4 mr-1.5 xl:mr-2" />
              Siège Social Numérique
            </Badge>
          </div>
          
          <h2 className="text-3xl xl:text-5xl font-bold mb-3 xl:mb-4 animate-slide-up tracking-tight">
            EMOTIONSCARE
          </h2>
          <div className="flex items-center justify-center gap-3 xl:gap-4 mb-6 xl:mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="h-px w-10 xl:w-12 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="text-2xl xl:text-3xl font-light text-accent tracking-[0.3em]">SASU</span>
            <div className="h-px w-10 xl:w-12 bg-gradient-to-l from-transparent to-accent/50" />
          </div>
          
          <p className="text-base xl:text-xl text-primary-foreground/70 mb-8 xl:mb-12 animate-slide-up leading-relaxed px-4" style={{ animationDelay: "0.2s" }}>
            Votre cockpit exécutif pour piloter les 5 plateformes de l'entreprise avec une précision chirurgicale.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 xl:gap-6 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="p-4 xl:p-6 rounded-xl xl:rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
              <div className="text-2xl xl:text-4xl font-bold text-accent mb-1 xl:mb-2">5</div>
              <div className="text-xs xl:text-sm text-primary-foreground/60">Plateformes</div>
            </div>
            <div className="p-4 xl:p-6 rounded-xl xl:rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
              <div className="text-2xl xl:text-4xl font-bold text-accent mb-1 xl:mb-2">21</div>
              <div className="text-xs xl:text-sm text-primary-foreground/60">Agents IA</div>
            </div>
            <div className="p-4 xl:p-6 rounded-xl xl:rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
              <div className="text-2xl xl:text-4xl font-bold text-accent mb-1 xl:mb-2">∞</div>
              <div className="text-xs xl:text-sm text-primary-foreground/60">Ambition</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
