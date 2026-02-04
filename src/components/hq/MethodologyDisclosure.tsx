import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BookOpen, 
  ChevronDown, 
  Database, 
  Calculator, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSource {
  name: string;
  type: "api" | "database" | "computed" | "manual" | "mock";
  refreshRate?: string;
  reliability: "verified" | "estimated" | "simulated";
  description?: string;
}

interface CalculationMethod {
  metric: string;
  formula?: string;
  assumptions?: string[];
  limitations?: string[];
}

interface MethodologyDisclosureProps {
  title?: string;
  sources: DataSource[];
  calculations?: CalculationMethod[];
  lastUpdated?: Date | string;
  dataQuality?: "high" | "medium" | "low";
  className?: string;
}

const reliabilityConfig = {
  verified: { label: "Vérifié", icon: CheckCircle, color: "text-success" },
  estimated: { label: "Estimé", icon: Calculator, color: "text-warning" },
  simulated: { label: "Simulé", icon: AlertTriangle, color: "text-muted-foreground" },
};

const typeLabels = {
  api: "API externe",
  database: "Base de données",
  computed: "Calculé",
  manual: "Saisie manuelle",
  mock: "Données test",
};

/**
 * Composant de transparence méthodologique — Standard HEC/Polytechnique
 * Affiche les sources de données, les méthodes de calcul et les limitations.
 */
export function MethodologyDisclosure({
  title = "Méthodologie & Sources",
  sources,
  calculations,
  lastUpdated,
  dataQuality = "high",
  className,
}: MethodologyDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);

  const qualityConfig = {
    high: { label: "Qualité haute", variant: "success" as const },
    medium: { label: "Qualité moyenne", variant: "warning" as const },
    low: { label: "Qualité limitée", variant: "subtle" as const },
  };

  return (
    <Card className={cn("card-executive", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {sources.length} source{sources.length > 1 ? "s" : ""} de données
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={qualityConfig[dataQuality].variant}>
                  {qualityConfig[dataQuality].label}
                </Badge>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-2">
            {/* Data Sources */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Sources de données
              </h4>
              <div className="space-y-3">
                {sources.map((source, index) => {
                  const reliability = reliabilityConfig[source.reliability];
                  const Icon = reliability.icon;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-start justify-between p-3 rounded-lg border bg-secondary/20"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn("h-4 w-4 mt-0.5", reliability.color)} />
                        <div>
                          <div className="font-medium text-sm">{source.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {typeLabels[source.type]}
                            {source.refreshRate && ` • Rafraîchissement : ${source.refreshRate}`}
                          </div>
                          {source.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {source.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="subtle" className="text-[10px]">
                        {reliability.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculation Methods */}
            {calculations && calculations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Méthodes de calcul
                </h4>
                <div className="space-y-3">
                  {calculations.map((calc, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-secondary/20">
                      <div className="font-medium text-sm mb-2">{calc.metric}</div>
                      {calc.formula && (
                        <code className="text-xs bg-secondary px-2 py-1 rounded block mb-2 font-mono">
                          {calc.formula}
                        </code>
                      )}
                      {calc.assumptions && calc.assumptions.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Hypothèses : </span>
                          {calc.assumptions.join(", ")}
                        </div>
                      )}
                      {calc.limitations && calc.limitations.length > 0 && (
                        <div className="text-xs text-warning mt-1">
                          <span className="font-medium">Limitations : </span>
                          {calc.limitations.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Données conformes RGPD</span>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    Mis à jour : {new Date(lastUpdated).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
