import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingDown } from "lucide-react";

const TICKET_TREND_DATA = [
  { week: "S-4", opened: 12, closed: 14 },
  { week: "S-3", opened: 15, closed: 13 },
  { week: "S-2", opened: 8, closed: 11 },
  { week: "S-1", opened: 10, closed: 12 },
  { week: "Cette sem.", opened: 6, closed: 8 },
];

export function TicketTrendChart() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <TrendingDown className="h-5 w-5 text-primary" />
          Tendance des Tickets
        </CardTitle>
        <CardDescription>
          Évolution sur 5 semaines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TICKET_TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="week" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="opened" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Ouverts"
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
              <Line 
                type="monotone" 
                dataKey="closed" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Fermés"
                dot={{ fill: 'hsl(var(--success))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Ouverts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Fermés</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
