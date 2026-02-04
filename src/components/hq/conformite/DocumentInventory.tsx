import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentCategory {
  name: string;
  count: number;
  color: string;
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { name: "Contrats", count: 45, color: "hsl(var(--primary))" },
  { name: "Rapports", count: 32, color: "hsl(var(--success))" },
  { name: "Politiques", count: 18, color: "hsl(var(--warning))" },
  { name: "Procès-verbaux", count: 24, color: "hsl(var(--accent))" },
  { name: "Autres", count: 12, color: "hsl(var(--muted-foreground))" },
];

interface DocumentInventoryProps {
  className?: string;
}

export function DocumentInventory({ className }: DocumentInventoryProps) {
  const totalDocuments = DOCUMENT_CATEGORIES.reduce((sum, c) => sum + c.count, 0);

  const handleExport = () => {
    const content = DOCUMENT_CATEGORIES.map(c => `${c.name}: ${c.count}`).join("\n");
    const blob = new Blob([`Inventaire des Documents\n\nTotal: ${totalDocuments}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventaire-documents.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Inventaire Documents
            </CardTitle>
            <CardDescription>
              Répartition des documents par catégorie
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="subtle">{totalDocuments} documents</Badge>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="50%" height={180}>
            <PieChart>
              <Pie
                data={DOCUMENT_CATEGORIES}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="count"
              >
                {DOCUMENT_CATEGORIES.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} documents`, name]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-2">
            {DOCUMENT_CATEGORIES.map((category) => (
              <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({((category.count / totalDocuments) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
