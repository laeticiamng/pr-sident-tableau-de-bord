import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "button" | "page";
}

export function SkeletonLoader({ className, variant = "card" }: SkeletonLoaderProps) {
  if (variant === "page") {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        {/* Hero Skeleton */}
        <div className="h-[60vh] bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-8 w-32 mx-auto bg-muted/50 rounded-full" />
            <div className="h-12 w-64 mx-auto bg-muted/50 rounded-lg" />
            <div className="h-6 w-48 mx-auto bg-muted/50 rounded-lg" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="container py-16 px-4 space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted/30 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("rounded-xl border bg-card p-6 space-y-4 animate-pulse", className)}>
        <div className="h-12 w-12 bg-muted rounded-lg" />
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted rounded" />
          <div className="h-4 w-full bg-muted/70 rounded" />
          <div className="h-4 w-2/3 bg-muted/70 rounded" />
        </div>
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-2 animate-pulse", className)}>
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted/70 rounded" />
        <div className="h-4 w-4/6 bg-muted/50 rounded" />
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("h-10 w-10 bg-muted rounded-full animate-pulse", className)} />
    );
  }

  if (variant === "button") {
    return (
      <div className={cn("h-10 w-24 bg-muted rounded-lg animate-pulse", className)} />
    );
  }

  return null;
}

export const PageLoader = forwardRef<HTMLDivElement, Record<string, never>>(
  function PageLoader(_, ref) {
    return (
      <div ref={ref} className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin border-t-accent" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }
);
PageLoader.displayName = "PageLoader";

export function CardGridLoader({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} variant="card" />
      ))}
    </div>
  );
}
