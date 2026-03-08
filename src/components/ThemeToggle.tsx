import { forwardRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor, Contrast } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { themeTranslations } from "@/i18n/theme";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "minimal";
}

export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  function ThemeToggle({ className, variant = "default" }, ref) {
    const { theme, setTheme, resolvedTheme, monochrome, setMonochrome } = useTheme();
    const t = useTranslation(themeTranslations);

    if (variant === "minimal") {
      return (
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={cn("h-9 w-9 relative overflow-hidden", className)}
          aria-label={resolvedTheme === "dark" ? t.toggleLight : t.toggleDark}
        >
          <Sun className="h-4 w-4 absolute transition-all duration-300 ease-out rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="h-4 w-4 absolute transition-all duration-300 ease-out rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t.changeTheme}</span>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            ref={ref}
            variant="ghost" 
            size="icon" 
            className={cn("h-9 w-9 relative overflow-hidden", className)}
            aria-label={t.selectTheme}
          >
            {monochrome ? (
              <Contrast className="h-4 w-4" />
            ) : (
              <>
                <Sun className="h-4 w-4 absolute transition-all duration-300 ease-out rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
                <Moon className="h-4 w-4 absolute transition-all duration-300 ease-out rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
              </>
            )}
            <span className="sr-only">{t.changeTheme}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="animate-in fade-in-0 zoom-in-95">
          <DropdownMenuItem 
            onClick={() => setTheme("light")} 
            className="gap-2 cursor-pointer"
          >
            <Sun className="h-4 w-4" />
            <span>{t.light}</span>
            {theme === "light" && <span className="ml-auto text-accent">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("dark")} 
            className="gap-2 cursor-pointer"
          >
            <Moon className="h-4 w-4" />
            <span>{t.dark}</span>
            {theme === "dark" && <span className="ml-auto text-accent">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("system")} 
            className="gap-2 cursor-pointer"
          >
            <Monitor className="h-4 w-4" />
            <span>{t.system}</span>
            {theme === "system" && <span className="ml-auto text-accent">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setMonochrome(!monochrome)} 
            className="gap-2 cursor-pointer"
          >
            <Contrast className="h-4 w-4" />
            <span>{t.monochrome}</span>
            {monochrome && <span className="ml-auto text-accent">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

ThemeToggle.displayName = "ThemeToggle";
