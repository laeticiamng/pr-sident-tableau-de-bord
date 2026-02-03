import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "hq-essential-mode";

interface EssentialModeToggleProps {
  className?: string;
  onModeChange?: (isEssential: boolean) => void;
}

export function useEssentialMode() {
  const [isEssential, setIsEssential] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isEssential));
  }, [isEssential]);

  return { isEssential, setIsEssential };
}

export function EssentialModeToggle({ className, onModeChange }: EssentialModeToggleProps) {
  const { isEssential, setIsEssential } = useEssentialMode();

  const handleChange = (checked: boolean) => {
    setIsEssential(checked);
    onModeChange?.(checked);
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        {isEssential ? (
          <Eye className="h-4 w-4 text-primary" />
        ) : (
          <Layers className="h-4 w-4 text-muted-foreground" />
        )}
        <Label 
          htmlFor="essential-mode" 
          className="text-sm cursor-pointer select-none"
        >
          {isEssential ? "Mode Essentiel" : "Vue complète"}
        </Label>
      </div>
      <Switch
        id="essential-mode"
        checked={isEssential}
        onCheckedChange={handleChange}
        aria-label="Activer le mode essentiel"
      />
    </div>
  );
}
