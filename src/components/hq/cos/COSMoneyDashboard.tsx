import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Users,
  Repeat,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Save,
} from "lucide-react";
import { type COSProject } from "@/lib/cos-types";
import { useState } from "react";

interface COSMoneyDashboardProps {
  aggregated: {
    totalMRR: number;
    totalRevenueOneShot: number;
    avgConversion: number;
    avgARPU: number;
    avgChurn: number;
    totalCAC: number;
    totalCustomers: number;
    totalTrials: number;
  };
  activeProjects: COSProject[];
  onUpdateMetrics: (projectId: string, metrics: Partial<COSProject["moneyMetrics"]>) => void;
}

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function COSMoneyDashboard({ aggregated, activeProjects, onUpdateMetrics }: COSMoneyDashboardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<COSProject["moneyMetrics"]>>({});

  const kpis = [
    {
      label: "MRR",
      value: formatEUR(aggregated.totalMRR),
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Revenu recurent mensuel",
    },
    {
      label: "Conversion",
      value: `${aggregated.avgConversion.toFixed(1)}%`,
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Visite → action",
    },
    {
      label: "ARPU",
      value: formatEUR(aggregated.avgARPU),
      icon: ArrowUpRight,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      description: "Revenu moyen par client",
    },
    {
      label: "Churn",
      value: `${aggregated.avgChurn.toFixed(1)}%`,
      icon: aggregated.avgChurn > 5 ? ArrowDownRight : Repeat,
      color: aggregated.avgChurn > 5 ? "text-destructive" : "text-amber-500",
      bg: aggregated.avgChurn > 5 ? "bg-destructive/10" : "bg-amber-500/10",
      description: "Taux d'attrition",
    },
    {
      label: "CAC",
      value: formatEUR(aggregated.totalCAC),
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      description: "Cout d'acquisition client",
    },
    {
      label: "Clients",
      value: aggregated.totalCustomers.toString(),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      description: `+ ${aggregated.totalTrials} essais actifs`,
    },
  ];

  const startEdit = (project: COSProject) => {
    setEditingId(project.id);
    setEditForm({ ...project.moneyMetrics });
  };

  const saveEdit = (projectId: string) => {
    onUpdateMetrics(projectId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Money Dashboard
            </CardTitle>
            <CardDescription>
              Le seul langage qui compte — agrege sur les projets actifs
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-500 text-emerald-500">
            {formatEUR(aggregated.totalMRR + aggregated.totalRevenueOneShot)} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="p-4 rounded-lg border text-center space-y-1"
            >
              <div className={`inline-flex p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div className="text-xl font-bold">{kpi.value}</div>
              <div className="text-xs font-medium text-muted-foreground">{kpi.label}</div>
              <div className="text-xs text-muted-foreground/70">{kpi.description}</div>
            </div>
          ))}
        </div>

        {/* Per-project breakdown */}
        {activeProjects.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Detail par projet actif</h4>
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <div key={project.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{project.name}</span>
                    {editingId === project.id ? (
                      <Button size="sm" variant="ghost" onClick={() => saveEdit(project.id)}>
                        <Save className="h-3.5 w-3.5 mr-1" />
                        OK
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => startEdit(project)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Editer
                      </Button>
                    )}
                  </div>
                  {editingId === project.id ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { key: "mrr" as const, label: "MRR" },
                        { key: "conversionRate" as const, label: "Conv. %" },
                        { key: "arpu" as const, label: "ARPU" },
                        { key: "churn" as const, label: "Churn %" },
                        { key: "cac" as const, label: "CAC" },
                        { key: "totalCustomers" as const, label: "Clients" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-xs text-muted-foreground">{label}</label>
                          <Input
                            type="number"
                            value={editForm[key] ?? 0}
                            onChange={(e) =>
                              setEditForm({ ...editForm, [key]: parseFloat(e.target.value) || 0 })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">MRR</div>
                        <div className="text-sm font-semibold">{formatEUR(project.moneyMetrics.mrr)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Conv.</div>
                        <div className="text-sm font-semibold">{project.moneyMetrics.conversionRate}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">ARPU</div>
                        <div className="text-sm font-semibold">{formatEUR(project.moneyMetrics.arpu)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Churn</div>
                        <div className="text-sm font-semibold">{project.moneyMetrics.churn}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">CAC</div>
                        <div className="text-sm font-semibold">{formatEUR(project.moneyMetrics.cac)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Clients</div>
                        <div className="text-sm font-semibold">{project.moneyMetrics.totalCustomers}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeProjects.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Activez un projet pour voir les metriques financieres.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
