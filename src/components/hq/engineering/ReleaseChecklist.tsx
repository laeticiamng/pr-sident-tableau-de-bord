import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, CheckCircle, Clock, AlertTriangle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

interface ChecklistItem {
  id: string;
  labelKey: string;
  category: "code" | "security" | "quality" | "ops";
  autoCheck?: boolean;
}

const RELEASE_CHECKLIST: ChecklistItem[] = [
  { id: "tests", labelKey: "tests", category: "code", autoCheck: true },
  { id: "review", labelKey: "review", category: "code" },
  { id: "docs", labelKey: "docs", category: "quality" },
  { id: "security", labelKey: "security", category: "security", autoCheck: true },
  { id: "performance", labelKey: "performance", category: "quality" },
  { id: "rollback", labelKey: "rollback", category: "ops" },
  { id: "staging", labelKey: "staging", category: "ops" },
  { id: "changelog", labelKey: "changelog", category: "quality" },
];

const categoryColors = {
  code: "bg-blue-500/10 text-blue-600",
  security: "bg-red-500/10 text-red-600",
  quality: "bg-green-500/10 text-green-600",
  ops: "bg-purple-500/10 text-purple-600",
};

interface ReleaseChecklistProps {
  platformKey?: string;
  onDeploy?: () => void;
}

export function ReleaseChecklist({ platformKey, onDeploy }: ReleaseChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(RELEASE_CHECKLIST.filter(i => i.autoCheck).map(i => i.id))
  );
  const t = useTranslation(hqCommon);
  const checklistItems = t.checklistItems as Record<string, { label: string; desc: string }>;
  const categoryLabels = t.categoryLabels as Record<string, string>;

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const allChecked = RELEASE_CHECKLIST.every(item => checkedItems.has(item.id));
  const progress = (checkedItems.size / RELEASE_CHECKLIST.length) * 100;

  return (
    <Card className="card-executive">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            {t.releaseChecklist}
          </CardTitle>
          <CardDescription>
            {t.validationCriteria}
            {platformKey && <span className="ml-1">({platformKey})</span>}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={allChecked ? "success" : "subtle"}>
            {checkedItems.size}/{RELEASE_CHECKLIST.length}
          </Badge>
          {allChecked && (
            <Button size="sm" variant="executive" onClick={onDeploy}>
              <Rocket className="h-4 w-4 mr-2" />
              {t.deploy}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                allChecked ? "bg-success" : progress >= 75 ? "bg-warning" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {RELEASE_CHECKLIST.map((item) => {
            const isChecked = checkedItems.has(item.id);
            const itemText = checklistItems[item.labelKey];
            return (
              <div 
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                  isChecked ? "border-success/30 bg-success/5" : "hover:bg-muted/30"
                )}
                onClick={() => toggleItem(item.id)}
              >
                <Checkbox 
                  id={item.id}
                  checked={isChecked}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <label 
                      htmlFor={item.id}
                      className={cn(
                        "text-sm font-medium cursor-pointer",
                        isChecked && "line-through text-muted-foreground"
                      )}
                    >
                      {itemText?.label || item.labelKey}
                    </label>
                    <Badge variant="outline" className={cn("text-[10px]", categoryColors[item.category])}>
                      {categoryLabels[item.category] || item.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{itemText?.desc || ""}</p>
                </div>
                {isChecked ? (
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {!allChecked && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm">
              {t.completeAllCriteria} ({RELEASE_CHECKLIST.length - checkedItems.size} {t.remaining})
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
