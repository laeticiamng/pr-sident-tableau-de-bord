import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CohortData {
  month: string;
  users: number;
  retention: number[];
}

interface CohortRetentionTableProps {
  data?: CohortData[];
  className?: string;
}

export function CohortRetentionTable({ data, className }: CohortRetentionTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Analyse de Cohortes
          </CardTitle>
          <CardDescription>Rétention mensuelle par cohorte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Connexion Analytics requise</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connectez votre analytics pour générer les cohortes</p>
            <Badge variant="outline" className="mt-3">Analytics</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxMonths = Math.max(...data.map(d => d.retention.length));

  const getRetentionColor = (value: number | undefined) => {
    if (value === undefined) return "";
    if (value >= 80) return "bg-success/20 text-success font-medium";
    if (value >= 60) return "bg-warning/20 text-warning font-medium";
    return "bg-destructive/20 text-destructive font-medium";
  };

  const avgRetention = data.length > 0 && data[0].retention.length > 1
    ? (data.reduce((acc, d) => acc + (d.retention[1] || 0), 0) / data.length).toFixed(1)
    : "N/A";

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Analyse de Cohortes
        </CardTitle>
        <CardDescription>Rétention moyenne M1 : {avgRetention}%</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium">Cohorte</th>
                <th className="text-center py-2 px-2 font-medium">Users</th>
                {Array.from({ length: maxMonths }).map((_, i) => (
                  <th key={i} className="text-center py-2 px-2 font-medium">M{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(cohort => (
                <tr key={cohort.month} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-3 pr-4"><span className="font-medium">{cohort.month}</span></td>
                  <td className="text-center py-3 px-2"><Badge variant="subtle">{cohort.users}</Badge></td>
                  {Array.from({ length: maxMonths }).map((_, monthIndex) => {
                    const retention = cohort.retention[monthIndex];
                    return (
                      <td key={monthIndex} className={cn("text-center py-3 px-2 rounded", getRetentionColor(retention))}>
                        {retention !== undefined ? `${retention}%` : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success/20" /><span>≥80%</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-warning/20" /><span>60-79%</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive/20" /><span>&lt;60%</span></div>
        </div>
      </CardContent>
    </Card>
  );
}
