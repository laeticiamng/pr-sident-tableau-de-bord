import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, BellRing, Smartphone, Send, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

export function PushNotificationSettings() {
  const { isSupported, isSubscribed, permission, isLoading, subscribe, unsubscribe, sendTest } = usePushNotifications();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    const success = await subscribe();
    toast({
      title: success ? "✅ Notifications activées" : "❌ Échec",
      description: success
        ? "Vous recevrez les alertes critiques sur cet appareil."
        : permission === "denied"
        ? "Les notifications sont bloquées dans les paramètres du navigateur."
        : "Impossible d'activer les notifications push.",
      variant: success ? "default" : "destructive",
    });
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) toast({ title: "Notifications désactivées", description: "Cet appareil ne recevra plus d'alertes." });
  };

  const handleTest = async () => {
    const success = await sendTest();
    toast({
      title: success ? "📨 Notification envoyée" : "❌ Échec de l'envoi",
      description: success ? "Vérifiez vos notifications." : "Erreur lors de l'envoi test.",
      variant: success ? "default" : "destructive",
    });
  };

  if (!isSupported) {
    return (
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellOff className="h-4 w-4 text-muted-foreground" />
            Notifications Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les notifications push ne sont pas supportées sur ce navigateur. Utilisez Chrome, Edge ou Safari sur iOS 16.4+.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-4 w-4 text-accent" />
              Notifications Push
            </CardTitle>
            <CardDescription className="text-xs">
              Alertes temps réel sur votre appareil
            </CardDescription>
          </div>
          <Badge variant={isSubscribed ? "default" : "outline"} className="text-[10px]">
            {isSubscribed ? (
              <><Smartphone className="h-2.5 w-2.5 mr-1" />Actif</>
            ) : "Inactif"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Vous serez alerté(e) quand :</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>Un <strong>run IA échoue</strong></li>
            <li>Une <strong>plateforme passe en rouge</strong></li>
            <li>Une <strong>décision attend depuis +24h</strong></li>
          </ul>
        </div>

        <div className="flex gap-2">
          {isSubscribed ? (
            <>
              <Button variant="outline" size="sm" onClick={handleUnsubscribe} disabled={isLoading} className="text-xs gap-1.5">
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BellOff className="h-3 w-3" />}
                Désactiver
              </Button>
              <Button variant="outline" size="sm" onClick={handleTest} disabled={isLoading} className="text-xs gap-1.5">
                <Send className="h-3 w-3" />
                Test
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleSubscribe} disabled={isLoading} className="text-xs gap-1.5">
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
              Activer les notifications
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
