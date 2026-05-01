import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logClientError } from "@/lib/clientErrorLogger";

const errorTexts = {
  fr: { title: "Une erreur est survenue", desc: "L'application a rencontré un problème inattendu. Veuillez réessayer ou retourner à l'accueil.", retry: "Réessayer", home: "Accueil", support: "Si le problème persiste, contactez le support technique." },
  en: { title: "An error occurred", desc: "The application encountered an unexpected problem. Please try again or go back to the home page.", retry: "Try again", home: "Home", support: "If the problem persists, contact technical support." },
  de: { title: "Ein Fehler ist aufgetreten", desc: "Die Anwendung hat ein unerwartetes Problem festgestellt. Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.", retry: "Erneut versuchen", home: "Startseite", support: "Wenn das Problem weiterhin besteht, wenden Sie sich an den technischen Support." },
} as const;

function getErrorTexts() {
  const lang = (typeof localStorage !== "undefined" && localStorage.getItem("preferred-lang")) || "fr";
  return errorTexts[lang as keyof typeof errorTexts] || errorTexts.fr;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    void logClientError(
      "react_render",
      `${error.message || "React render error"} ${errorInfo.componentStack || ""}`.slice(0, 1000),
    );

    // Only log in development to avoid leaking stack traces in production
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
      console.group("Application Error");
      console.error("Error:", error.message);
      console.error("Stack:", error.stack);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    // Full reload intentionnel : ErrorBoundary catastrophique → reset complet du tree React + state
    window.location.assign("/");
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const t = getErrorTexts();

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full border-destructive/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">{t.title}</CardTitle>
              <CardDescription>{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="font-mono text-sm text-destructive mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="default" onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.retry}
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  {t.home}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">{t.support}</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
