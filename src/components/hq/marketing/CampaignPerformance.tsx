import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Play, Pause, Eye } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  channel: "email" | "social" | "ads" | "content";
  status: "active" | "paused" | "completed";
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  cpl: number; // Cost per lead
}

const mockCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Lancement Growth Copilot v2",
    channel: "email",
    status: "active",
    budget: 2000,
    spent: 1250,
    leads: 145,
    conversions: 23,
    cpl: 8.62
  },
  {
    id: "camp-2",
    name: "Retargeting EmotionsCare",
    channel: "ads",
    status: "active",
    budget: 3500,
    spent: 2100,
    leads: 89,
    conversions: 12,
    cpl: 23.60
  },
  {
    id: "camp-3",
    name: "Content SEO Q1",
    channel: "content",
    status: "paused",
    budget: 1500,
    spent: 800,
    leads: 210,
    conversions: 18,
    cpl: 3.81
  },
];

const channelColors = {
  email: "bg-blue-500",
  social: "bg-pink-500",
  ads: "bg-orange-500",
  content: "bg-green-500",
};

const statusConfig = {
  active: { color: "success", label: "Active" },
  paused: { color: "warning", label: "En pause" },
  completed: { color: "subtle", label: "Terminée" },
} as const;

export function CampaignPerformance() {
  const totalLeads = mockCampaigns.reduce((sum, c) => sum + c.leads, 0);
  const totalConversions = mockCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCPL = mockCampaigns.reduce((sum, c) => sum + c.cpl, 0) / mockCampaigns.length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          Performance Campagnes
        </CardTitle>
        <CardDescription>
          {totalLeads} leads générés • {totalConversions} conversions • CPL moy: {avgCPL.toFixed(2)}€
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockCampaigns.map((campaign) => {
            const budgetProgress = (campaign.spent / campaign.budget) * 100;
            const conversionRate = ((campaign.conversions / campaign.leads) * 100).toFixed(1);
            
            return (
              <div key={campaign.id} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${channelColors[campaign.channel]}`} />
                    <div>
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="subtle" className="text-xs capitalize">
                          {campaign.channel}
                        </Badge>
                        <Badge variant={statusConfig[campaign.status].color}>
                          {statusConfig[campaign.status].label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {campaign.status === "active" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3 text-center">
                  <div>
                    <div className="text-lg font-bold">{campaign.leads}</div>
                    <div className="text-xs text-muted-foreground">Leads</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-success">{campaign.conversions}</div>
                    <div className="text-xs text-muted-foreground">Conversions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{conversionRate}%</div>
                    <div className="text-xs text-muted-foreground">Taux Conv.</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{campaign.cpl.toFixed(2)}€</div>
                    <div className="text-xs text-muted-foreground">CPL</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Budget utilisé</span>
                    <span className="font-medium">{campaign.spent}€ / {campaign.budget}€</span>
                  </div>
                  <Progress value={budgetProgress} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
