import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, PieChart } from "lucide-react";

const CHANNEL_DATA = [
  { channel: "SEO", spend: 2400, revenue: 12800, roi: 433 },
  { channel: "Paid Ads", spend: 5200, revenue: 15600, roi: 200 },
  { channel: "Email", spend: 800, revenue: 6400, roi: 700 },
  { channel: "Social", spend: 1600, revenue: 4800, roi: 200 },
  { channel: "Referral", spend: 400, revenue: 8000, roi: 1900 },
];

const getROIColor = (roi: number) => {
  if (roi >= 500) return "hsl(var(--success))";
  if (roi >= 200) return "hsl(var(--primary))";
  return "hsl(var(--warning))";
};

export function ChannelROIChart() {
  const totalSpend = CHANNEL_DATA.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = CHANNEL_DATA.reduce((sum, c) => sum + c.revenue, 0);
  const overallROI = ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(0);

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <PieChart className="h-5 w-5 text-primary" />
          ROI par Canal Marketing
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>ROI global: </span>
          <Badge variant="success">{overallROI}%</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={CHANNEL_DATA} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="channel" width={70} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === "roi" ? `${value}%` : `${value.toLocaleString("fr-FR")} €`,
                name === "roi" ? "ROI" : name === "spend" ? "Dépenses" : "Revenus"
              ]}
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Bar dataKey="roi" name="ROI" radius={[0, 4, 4, 0]}>
              {CHANNEL_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getROIColor(entry.roi)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">Investissement Total</p>
            <p className="text-xl font-bold">{totalSpend.toLocaleString("fr-FR")} €</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">Revenus Générés</p>
            <p className="text-xl font-bold text-success">{totalRevenue.toLocaleString("fr-FR")} €</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
