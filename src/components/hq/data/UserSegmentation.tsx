import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, TrendingUp } from "lucide-react";

interface Segment {
  name: string;
  users: number;
  revenue: number;
  growth: number;
  color: string;
}

const mockSegments: Segment[] = [
  { name: "Enterprise", users: 45, revenue: 18500, growth: 25, color: "hsl(var(--primary))" },
  { name: "Pro", users: 230, revenue: 9200, growth: 18, color: "hsl(var(--success))" },
  { name: "Starter", users: 580, revenue: 4640, growth: 12, color: "hsl(var(--accent))" },
  { name: "Free Trial", users: 1200, revenue: 0, growth: 35, color: "hsl(var(--muted-foreground))" },
];

export function UserSegmentation() {
  const totalUsers = mockSegments.reduce((sum, s) => sum + s.users, 0);

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          Segmentation Utilisateurs
        </CardTitle>
        <CardDescription>
          {totalUsers.toLocaleString()} utilisateurs répartis par plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockSegments} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [value.toLocaleString(), "Utilisateurs"]}
              />
              <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                {mockSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {mockSegments.map((segment) => (
            <div key={segment.name} className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="font-medium text-sm">{segment.name}</span>
                </div>
                <Badge variant="subtle" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{segment.growth}%
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{segment.users} users</span>
                <span className="font-semibold">
                  {segment.revenue > 0 ? `${(segment.revenue / 100).toFixed(0)}€ MRR` : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
