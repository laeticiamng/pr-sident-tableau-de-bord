import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, CheckCircle, Clock, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  title: string;
  type: "blog" | "newsletter" | "social" | "webinar" | "video";
  platform: string;
  status: "draft" | "scheduled" | "published";
  date: string;
  dayOfWeek: number; // 0-6
}

const CONTENT_ITEMS: ContentItem[] = [
  { id: "1", title: "Article: IA & Bien-être", type: "blog", platform: "EmotionsCare", status: "scheduled", date: "2026-02-04", dayOfWeek: 0 },
  { id: "2", title: "Post LinkedIn", type: "social", platform: "Growth Copilot", status: "draft", date: "2026-02-04", dayOfWeek: 0 },
  { id: "3", title: "Newsletter Février", type: "newsletter", platform: "All", status: "scheduled", date: "2026-02-06", dayOfWeek: 2 },
  { id: "4", title: "Thread Twitter", type: "social", platform: "System Compass", status: "published", date: "2026-02-07", dayOfWeek: 3 },
  { id: "5", title: "Webinar Q1", type: "webinar", platform: "EmotionsCare", status: "scheduled", date: "2026-02-07", dayOfWeek: 4 },
  { id: "6", title: "Vidéo Tutoriel", type: "video", platform: "Med MNG", status: "draft", date: "2026-02-08", dayOfWeek: 5 },
];

const typeColors: Record<string, string> = {
  blog: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  newsletter: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  social: "bg-green-500/10 text-green-600 border-green-500/30",
  webinar: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  video: "bg-red-500/10 text-red-600 border-red-500/30",
};

const typeLabels: Record<string, string> = {
  blog: "Blog",
  newsletter: "Newsletter",
  social: "Social",
  webinar: "Webinar",
  video: "Vidéo",
};

const statusIcons = {
  draft: <Edit className="h-3 w-3 text-muted-foreground" />,
  scheduled: <Clock className="h-3 w-3 text-warning" />,
  published: <CheckCircle className="h-3 w-3 text-success" />,
};

export function ContentCalendar() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const getItemsForDay = (dayIndex: number) => {
    return CONTENT_ITEMS.filter(item => item.dayOfWeek === dayIndex);
  };

  const stats = {
    total: CONTENT_ITEMS.length,
    scheduled: CONTENT_ITEMS.filter(i => i.status === "scheduled").length,
    draft: CONTENT_ITEMS.filter(i => i.status === "draft").length,
    published: CONTENT_ITEMS.filter(i => i.status === "published").length,
  };

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              Calendrier de Contenu
            </CardTitle>
            <CardDescription>
              Planification du contenu pour les 5 plateformes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="subtle">{stats.scheduled} planifiés</Badge>
            <Badge variant="outline">{stats.draft} brouillons</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekly Grid */}
        <div className="grid gap-3 md:grid-cols-7 mb-6">
          {days.map((day, index) => {
            const items = getItemsForDay(index);
            const isSelected = selectedDay === index;
            const isWeekend = index >= 5;
            
            return (
              <div 
                key={day}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 transition-all",
                  isSelected && "ring-2 ring-primary border-primary",
                  isWeekend ? "bg-muted/20" : "bg-card hover:bg-muted/30",
                  items.length > 0 && "border-primary/30"
                )}
                onClick={() => setSelectedDay(isSelected ? null : index)}
              >
                <div className="text-sm font-medium text-center mb-2">{day}</div>
                <div className="min-h-[60px] space-y-1">
                  {items.slice(0, 2).map(item => (
                    <Badge 
                      key={item.id}
                      variant="outline"
                      className={cn("text-[10px] w-full justify-start truncate", typeColors[item.type])}
                    >
                      {statusIcons[item.status]}
                      <span className="ml-1 truncate">{typeLabels[item.type]}</span>
                    </Badge>
                  ))}
                  {items.length > 2 && (
                    <Badge variant="subtle" className="text-[10px] w-full justify-center">
                      +{items.length - 2} autres
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedDay !== null && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">
              {days[selectedDay]} - {getItemsForDay(selectedDay).length} contenu(s)
            </h4>
            <div className="space-y-2">
              {getItemsForDay(selectedDay).map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    {statusIcons[item.status]}
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.platform}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", typeColors[item.type])}>
                    {typeLabels[item.type]}
                  </Badge>
                </div>
              ))}
              {getItemsForDay(selectedDay).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun contenu planifié</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
          {Object.entries(typeLabels).slice(0, 4).map(([key, label]) => {
            const count = CONTENT_ITEMS.filter(i => i.type === key).length;
            return (
              <div key={key} className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
