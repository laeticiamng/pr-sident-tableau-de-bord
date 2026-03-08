import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Loader2, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getPasswordSchema } from "@/lib/validation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/contexts/LanguageContext";
import { authTranslations } from "@/i18n/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const t = useTranslation(authTranslations);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    if (type === "recovery") setIsValidSession(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsValidSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = getPasswordSchema().safeParse(password);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t.resetMismatch);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success(t.resetSuccessToast);
        setTimeout(() => navigate("/hq"), 2000);
      }
    } catch {
      toast.error(t.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 left-4 z-20">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t.backToHome}</span>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl">
              <Building2 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{t.resetTitle}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t.resetBrand}</p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4 p-6 rounded-xl border bg-card">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <p className="font-medium">{t.resetSuccess}</p>
            <p className="text-sm text-muted-foreground">{t.resetRedirecting}</p>
          </div>
        ) : !isValidSession ? (
          <div className="text-center space-y-4 p-6 rounded-xl border bg-card">
            <p className="text-muted-foreground">{t.resetInvalidLink}</p>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              {t.resetBackToLogin}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border bg-card">
            <div className="space-y-2">
              <Label htmlFor="password">{t.resetNewPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder={t.resetNewPasswordPlaceholder}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t.resetConfirm}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder={t.resetConfirmPlaceholder}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t.resetSubmit}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
