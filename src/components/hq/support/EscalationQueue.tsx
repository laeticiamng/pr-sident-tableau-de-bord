import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, User, ArrowRight } from "lucide-react";

interface EscalatedTicket {
  id: string;
  subject: string;
  priority: "critical" | "high";
  platform: string;
  waitTime: string;
  assignee?: string;
}

const mockEscalations: EscalatedTicket[] = [
  {
    id: "ESC-001",
    subject: "Panne système EmotionsCare",
    priority: "critical",
    platform: "emotionscare",
    waitTime: "15min",
  },
  {
    id: "ESC-002",
    subject: "Données utilisateur manquantes",
    priority: "high",
    platform: "growth-copilot",
    waitTime: "45min",
    assignee: "Support L2"
  },
];

export function EscalationQueue() {
  return (
    <Card className="card-executive border-warning/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          File d'Escalation
        </CardTitle>
        <CardDescription>
          Tickets critiques nécessitant une attention immédiate
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mockEscalations.length > 0 ? (
          <div className="space-y-3">
            {mockEscalations.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`p-4 rounded-lg border ${
                  ticket.priority === "critical" 
                    ? "border-destructive/50 bg-destructive/5" 
                    : "border-warning/50 bg-warning/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                      <Badge variant={ticket.priority === "critical" ? "destructive" : "warning"}>
                        {ticket.priority === "critical" ? "CRITIQUE" : "HAUTE"}
                      </Badge>
                    </div>
                    <h4 className="font-semibold">{ticket.subject}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ticket.waitTime}
                      </span>
                      {ticket.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.assignee}
                        </span>
                      )}
                      <Badge variant="subtle">{ticket.platform}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Traiter
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-success" />
            <p className="font-medium">Aucune escalation en cours</p>
            <p className="text-sm mt-1">Tous les tickets critiques sont traités.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
