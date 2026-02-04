import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, UserMinus, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CohortData {
  month: string;
  users: number;
  retention: number[];
}

const COHORT_DATA: CohortData[] = [
  { month: "Oct 2025", users: 120, retention: [100, 72, 58, 45, 38] },
  { month: "Nov 2025", users: 145, retention: [100, 75, 62, 48] },
  { month: "Déc 2025", users: 98, retention: [100, 68, 54] },
  { month: "Jan 2026", users: 167, retention: [100, 78] },
  { month: "Fév 2026", users: 89, retention: [100] },
];

const RETENTION_THRESHOLDS = {
  excellent: 70,
  good: 50,
  warning: 30,
};

export function CohortAnalysis() {
  const getRetentionColor = (value: number) => {
    if (value >= RETENTION_THRESHOLDS.excellent) return "bg-success text-success-foreground";
    if (value >= RETENTION_THRESHOLDS.good) return "bg-warning text-warning-foreground";
    if (value >= RETENTION_THRESHOLDS.warning) return "bg-orange-500 text-white";
    return "bg-destructive text-destructive-foreground";
  };

  const getRetentionBadge = (value: number) => {
    if (value >= RETENTION_THRESHOLDS.excellent) return "success";
    if (value >= RETENTION_THRESHOLDS.good) return "warning";
    return "destructive";
  };

  // Calculate average retention per period
  const avgRetention = [0, 1, 2, 3, 4].map(period => {
    const values = COHORT_DATA
      .filter(c => c.retention[period] !== undefined)
      .map(c => c.retention[period]);
    return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  });

  const totalUsers = COHORT_DATA.reduce((sum, c) => sum + c.users, 0);

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              Analyse de Cohorte
            </CardTitle>
            <CardDescription>
              Rétention mensuelle des utilisateurs
            </CardDescription>
          </div>
          <Badge variant="subtle">{totalUsers} utilisateurs</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Cohort Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Cohorte</th>
                <th className="text-center py-2 px-2 font-medium text-xs text-muted-foreground">Taille</th>
                <th className="text-center py-2 px-2 font-medium text-xs text-muted-foreground">M0</th>
                <th className="text-center py-2 px-2 font-medium text-xs text-muted-foreground">M1</th>
                <th className="text-center py-2 px-2 font-medium text-xs text-muted-foreground">M2</th>
                <th className="text-center py-2 px-2 font-medium text-xs text-muted-foreground">M3</th>
                <th className="text-center py-2 px-2 font-medium text-xs text-muted-foreground">M4</th>
              </tr>
            </thead>
            <tbody>
              {COHORT_DATA.map((cohort) => (
                <tr key={cohort.month} className="border-b hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {cohort.month}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <Badge variant="outline" className="text-xs">
                      {cohort.users}
                    </Badge>
                  </td>
                  {[0, 1, 2, 3, 4].map((period) => (
                    <td key={period} className="py-2 px-2 text-center">
                      {cohort.retention[period] !== undefined ? (
                        <div 
                          className={cn(
                            "w-10 h-8 rounded flex items-center justify-center text-xs font-medium mx-auto",
                            getRetentionColor(cohort.retention[period])
                          )}
                        >
                          {cohort.retention[period]}%
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-medium">
                <td className="py-2 px-3">Moyenne</td>
                <td className="py-2 px-2 text-center">—</td>
                {avgRetention.map((avg, i) => (
                  <td key={i} className="py-2 px-2 text-center">
                    {avg !== null ? (
                      <Badge variant={getRetentionBadge(avg)} className="text-xs">
                        {avg}%
                      </Badge>
                    ) : "—"}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <UserPlus className="h-4 w-4 text-success" />
              <span className="text-lg font-bold text-success">+{COHORT_DATA[COHORT_DATA.length - 1]?.users || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Nouveaux ce mois</p>
          </div>
          <div className="text-center">
            <span className="text-lg font-bold">{avgRetention[1] || 0}%</span>
            <p className="text-xs text-muted-foreground">Rétention M1</p>
          </div>
          <div className="text-center">
            <span className="text-lg font-bold">{avgRetention[3] || 0}%</span>
            <p className="text-xs text-muted-foreground">Rétention M3</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {(avgRetention[1] || 0) >= 70 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-warning" />
              )}
              <span className="text-lg font-bold">
                {(avgRetention[1] || 0) >= 70 ? "Bon" : "À améliorer"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Statut global</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-muted-foreground">≥70%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning" />
            <span className="text-muted-foreground">50-69%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-muted-foreground">30-49%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-destructive" />
            <span className="text-muted-foreground">&lt;30%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
