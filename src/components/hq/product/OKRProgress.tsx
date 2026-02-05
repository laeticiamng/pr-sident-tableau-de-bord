import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Target, ChevronDown, TrendingUp, AlertTriangle, CheckCircle, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface KeyResult {
  name: string;
  progress: number;
}

interface OKR {
  objective: string;
  progress: number;
  status: string;
  keyResults: KeyResult[];
}

interface OKRProgressProps {
  loading?: boolean;
  okrs?: OKR[];
}

const statusConfig = {
  on_track: {
    label: "Sur la bonne voie",
    color: "text-success",
    bgColor: "bg-success/10",
    variant: "success" as const,
  },
  at_risk: {
    label: "À risque",
    color: "text-warning",
    bgColor: "bg-warning/10",
    variant: "warning" as const,
  },
  off_track: {
    label: "En retard",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    variant: "destructive" as const,
  },
};

export function OKRProgress({ loading, okrs = [] }: OKRProgressProps) {
  const [openOKRs, setOpenOKRs] = useState<Set<number>>(new Set([0]));

  const toggleOKR = (index: number) => {
    const newOpen = new Set(openOKRs);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenOKRs(newOpen);
  };

  const avgProgress = okrs.length > 0 ? okrs.reduce((sum, okr) => sum + okr.progress, 0) / okrs.length : 0;
  const onTrackCount = okrs.filter(okr => okr.status === "on_track").length;

  if (loading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (okrs.length === 0) {
    return (
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 rounded-full bg-muted/50 mb-3">
            <Database className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Aucun OKR configuré</h3>
          <p className="text-xs text-muted-foreground max-w-[250px]">
            Connectez un outil de gestion produit (Linear, Jira, Notion) pour synchroniser vos OKRs.
          </p>
          <Badge variant="outline" className="text-[10px] mt-3 gap-1">
            <AlertTriangle className="h-2.5 w-2.5" />
            Source requise : Linear / Jira
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            OKRs Q1 2026
          </CardTitle>
          <CardDescription>Objectifs et résultats clés du trimestre</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="subtle">{avgProgress.toFixed(0)}% global</Badge>
          <Badge variant="success">{onTrackCount}/{okrs.length} on track</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {okrs.map((okr, index) => {
            const status = statusConfig[okr.status as keyof typeof statusConfig] || statusConfig.on_track;
            const isOpen = openOKRs.has(index);

            return (
              <Collapsible key={index} open={isOpen} onOpenChange={() => toggleOKR(index)}>
                <div className={cn(
                  "rounded-lg border transition-all",
                  isOpen && "border-primary/30 shadow-sm"
                )}>
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", status.bgColor)}>
                          {okr.status === "on_track" ? (
                            <TrendingUp className={cn("h-4 w-4", status.color)} />
                          ) : okr.status === "at_risk" ? (
                            <AlertTriangle className={cn("h-4 w-4", status.color)} />
                          ) : (
                            <Target className={cn("h-4 w-4", status.color)} />
                          )}
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold">{okr.objective}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {okr.keyResults.length} résultats clés
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-2xl font-bold">{okr.progress}%</span>
                        </div>
                        <ChevronDown className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          isOpen && "rotate-180"
                        )} />
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <Progress value={okr.progress} className="h-2" />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3 border-t pt-4">
                      {okr.keyResults.map((kr, krIndex) => (
                        <div key={krIndex} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            {kr.progress >= 100 ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : kr.progress >= 70 ? (
                              <TrendingUp className="h-4 w-4 text-primary" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                            <span className="text-sm">{kr.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all",
                                  kr.progress >= 100 ? "bg-success" : 
                                  kr.progress >= 70 ? "bg-primary" : 
                                  "bg-warning"
                                )}
                                style={{ width: `${Math.min(kr.progress, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-sm font-medium min-w-[40px] text-right">
                              {kr.progress}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
