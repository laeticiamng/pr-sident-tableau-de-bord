import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/i18n/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors",
            className
          )}
          aria-label="Changer de langue"
        >
          <span className="text-base leading-none">{current.flag}</span>
          <span className="hidden sm:inline text-xs text-muted-foreground uppercase">{current.code}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="end">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => { setLanguage(lang.code); setOpen(false); }}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
              language === lang.code
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-secondary text-foreground"
            )}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
