import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onRangeChange: (range: { from: Date | null; to: Date | null; label: string }) => void;
  className?: string;
}

const PRESETS = [
  { label: "Aujourd'hui", value: "today", days: 0 },
  { label: "7 derniers jours", value: "7d", days: 7 },
  { label: "30 derniers jours", value: "30d", days: 30 },
  { label: "90 derniers jours", value: "90d", days: 90 },
  { label: "Cette année", value: "year", days: 365 },
  { label: "Tout", value: "all", days: null },
];

export function DateRangeFilter({ onRangeChange, className }: DateRangeFilterProps) {
  const [selected, setSelected] = useState("30d");

  const handleSelect = (preset: typeof PRESETS[0]) => {
    setSelected(preset.value);
    
    const to = new Date();
    let from: Date | null = null;
    
    if (preset.days !== null) {
      from = new Date();
      from.setDate(from.getDate() - preset.days);
    }
    
    onRangeChange({ from, to, label: preset.label });
  };

  const selectedLabel = PRESETS.find(p => p.value === selected)?.label || "Sélectionner";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Calendar className="h-4 w-4" />
          <span>{selectedLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {PRESETS.map((preset, index) => (
          <div key={preset.value}>
            {index === PRESETS.length - 1 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => handleSelect(preset)}
              className="flex items-center justify-between"
            >
              <span>{preset.label}</span>
              {selected === preset.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for inline use
export function DateRangeBadges({ 
  selected, 
  onSelect 
}: { 
  selected: string; 
  onSelect: (value: string) => void 
}) {
  const quickFilters = [
    { label: "24h", value: "1d" },
    { label: "7j", value: "7d" },
    { label: "30j", value: "30d" },
    { label: "Tout", value: "all" },
  ];

  return (
    <div className="flex gap-2">
      {quickFilters.map((filter) => (
        <Badge
          key={filter.value}
          variant={selected === filter.value ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10"
          onClick={() => onSelect(filter.value)}
        >
          {filter.label}
        </Badge>
      ))}
    </div>
  );
}
