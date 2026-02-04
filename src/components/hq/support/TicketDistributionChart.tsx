import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BarChart4 } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock ticket distribution data
const TICKET_DISTRIBUTION = [
  { name: "Bug", value: 35, color: "hsl(var(--destructive))" },
  { name: "Feature Request", value: 28, color: "hsl(var(--primary))" },
  { name: "Question", value: 22, color: "hsl(var(--accent))" },
  { name: "Documentation", value: 10, color: "hsl(var(--muted-foreground))" },
  { name: "Amélioration", value: 5, color: "hsl(var(--success))" },
];

const PLATFORM_DISTRIBUTION = [
  { platform: "EmotionsCare", tickets: 42, resolved: 38 },
  { platform: "Growth Copilot", tickets: 28, resolved: 25 },
  { platform: "System Compass", tickets: 18, resolved: 18 },
  { platform: "Med MNG", tickets: 8, resolved: 7 },
  { platform: "Pixel Perfect", tickets: 4, resolved: 4 },
];

interface TicketDistributionChartProps {
  className?: string;
}

export function TicketDistributionChart({ className }: TicketDistributionChartProps) {
  const totalTickets = TICKET_DISTRIBUTION.reduce((sum, t) => sum + t.value, 0);

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart4 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Distribution des Tickets</CardTitle>
            <CardDescription>{totalTickets} tickets ce mois par catégorie</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pie Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={TICKET_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {TICKET_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value} tickets (${Math.round((value/totalTickets)*100)}%)`, '']}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium mb-3">Par plateforme</p>
          {PLATFORM_DISTRIBUTION.map((platform) => {
            const resolutionRate = Math.round((platform.resolved / platform.tickets) * 100);
            
            return (
              <div key={platform.platform} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{platform.platform}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{platform.tickets}</span>
                  <Badge 
                    variant={resolutionRate === 100 ? "success" : "subtle"}
                    className="text-xs"
                  >
                    {resolutionRate}% résolu
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
