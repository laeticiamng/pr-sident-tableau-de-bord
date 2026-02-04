import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldOff, ShieldCheck, Loader2, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PanicSwitchProps {
  className?: string;
  compact?: boolean;
}

export function PanicSwitch({ className, compact = false }: PanicSwitchProps) {
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();

  const handleActivatePanic = async () => {
    setIsActivating(true);
    // Simule l'activation du mode panique
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsPanicMode(true);
    setIsActivating(false);
    
    toast({
      title: "🚨 Mode Panique Activé",
      description: "Toutes les exécutions d'agents IA sont bloquées. Seules les opérations manuelles sont autorisées.",
      variant: "destructive",
    });
  };

  const handleDeactivatePanic = async () => {
    setIsActivating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPanicMode(false);
    setIsActivating(false);
    
    toast({
      title: "✅ Mode Normal Rétabli",
      description: "Les agents IA peuvent reprendre leurs opérations.",
    });
  };

  if (compact) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant={isPanicMode ? "destructive" : "outline"}
            size="sm"
            className={cn("gap-2", className)}
            disabled={isActivating}
          >
            {isActivating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPanicMode ? (
              <ShieldOff className="h-4 w-4" />
            ) : (
              <Power className="h-4 w-4" />
            )}
            {isPanicMode ? "Mode Panique" : "Panic Switch"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {isPanicMode ? "Désactiver le Mode Panique ?" : "Activer le Mode Panique ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPanicMode 
                ? "Cette action rétablira les opérations normales des agents IA."
                : "Cette action bloquera immédiatement TOUTES les exécutions automatiques des agents IA. Utilisez uniquement en cas d'urgence."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={isPanicMode ? handleDeactivatePanic : handleActivatePanic}
              className={isPanicMode ? "" : "bg-destructive hover:bg-destructive/90"}
            >
              {isPanicMode ? "Désactiver" : "Activer le Mode Panique"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Card className={cn(
      "card-executive border-2",
      isPanicMode ? "border-destructive/50 bg-destructive/5" : "border-warning/30",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {isPanicMode ? (
            <ShieldOff className="h-5 w-5 text-destructive" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning" />
          )}
          Panic Switch
        </CardTitle>
        <CardDescription>
          Arrêt d'urgence de toutes les opérations IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-3 w-3 rounded-full animate-pulse",
              isPanicMode ? "bg-destructive" : "bg-success"
            )} />
            <span className="text-sm font-medium">
              {isPanicMode ? "Mode Panique Actif" : "Opérations Normales"}
            </span>
          </div>
          <Badge variant={isPanicMode ? "destructive" : "success"}>
            {isPanicMode ? "BLOQUÉ" : "ACTIF"}
          </Badge>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant={isPanicMode ? "outline" : "destructive"} 
              className="w-full"
              disabled={isActivating}
            >
              {isActivating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isPanicMode ? (
                <ShieldCheck className="h-4 w-4 mr-2" />
              ) : (
                <ShieldOff className="h-4 w-4 mr-2" />
              )}
              {isPanicMode ? "Rétablir les Opérations" : "Activer Mode Panique"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {isPanicMode ? "Désactiver le Mode Panique ?" : "Confirmer l'Arrêt d'Urgence"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isPanicMode 
                  ? "Cela permettra aux agents IA de reprendre leurs opérations automatiques."
                  : "Cette action bloquera immédiatement TOUTES les exécutions automatiques des agents IA. Les opérations manuelles restent possibles. Utilisez uniquement en cas d'urgence grave."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={isPanicMode ? handleDeactivatePanic : handleActivatePanic}
                className={isPanicMode ? "" : "bg-destructive hover:bg-destructive/90"}
              >
                {isPanicMode ? "Rétablir" : "ACTIVER PANIC MODE"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
