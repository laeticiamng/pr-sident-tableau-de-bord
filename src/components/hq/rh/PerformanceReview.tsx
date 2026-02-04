import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Award, TrendingUp, Star } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  performance: "exceeds" | "meets" | "developing";
  completedGoals: number;
  totalGoals: number;
  rating: number;
}

const mockEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "Agent CFO",
    role: "Directeur Financier",
    department: "Finance",
    performance: "exceeds",
    completedGoals: 8,
    totalGoals: 10,
    rating: 4.8
  },
  {
    id: "emp-2",
    name: "Agent CMO",
    role: "Directeur Marketing",
    department: "Marketing",
    performance: "meets",
    completedGoals: 6,
    totalGoals: 8,
    rating: 4.2
  },
  {
    id: "emp-3",
    name: "Agent CTO",
    role: "Directeur Technique",
    department: "Engineering",
    performance: "exceeds",
    completedGoals: 12,
    totalGoals: 12,
    rating: 4.9
  },
];

const performanceColors = {
  exceeds: "success",
  meets: "default",
  developing: "warning",
} as const;

const performanceLabels = {
  exceeds: "Dépasse",
  meets: "Atteint",
  developing: "En développement",
};

export function PerformanceReview() {
  const avgRating = (mockEmployees.reduce((sum, e) => sum + e.rating, 0) / mockEmployees.length).toFixed(1);
  const topPerformers = mockEmployees.filter(e => e.performance === "exceeds").length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Award className="h-5 w-5 text-primary" />
          Revue de Performance
        </CardTitle>
        <CardDescription>
          {topPerformers} top performers • Note moyenne : {avgRating}/5
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockEmployees.map((employee) => {
            const goalProgress = Math.round((employee.completedGoals / employee.totalGoals) * 100);
            
            return (
              <div 
                key={employee.id}
                className="flex items-center gap-4 p-4 rounded-lg border"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {employee.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{employee.name}</h4>
                    <Badge variant={performanceColors[employee.performance]}>
                      {performanceLabels[employee.performance]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {employee.role} • {employee.department}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="font-bold">{employee.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    {employee.completedGoals}/{employee.totalGoals} objectifs ({goalProgress}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
