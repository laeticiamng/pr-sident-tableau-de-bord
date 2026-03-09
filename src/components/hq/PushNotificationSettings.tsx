import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, BellRing, Smartphone, Send, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

export function PushNotificationSettings() {
  const { isSupported, isSubscribed, permission, isLoading, subscribe, unsubscribe, sendTest } = usePushNotifications();
  const { toast } = useToast();
  const t = useTranslation(hqCommon);

  const handleSubscribe = async () => {
    const success = await subscribe();
    toast({
      title: success ? t.pushEnabled : t.pushFailed,
      description: success
        ? t.pushEnabledDesc
        : permission === "denied"
        ? t.pushBlockedDesc
        : t.pushFailedDesc,
      variant: success ? "default" : "destructive",
    });
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) toast({ title: t.pushDisabled, description: t.pushDisabledDesc });
  };

  const handleTest = async () => {
    const success = await sendTest();
    toast({
      title: success ? t.pushTestSent : t.pushTestFailed,
      description: success ? t.pushTestSentDesc : t.pushTestFailedDesc,
      variant: success ? "default" : "destructive",
    });
  };

  if (!isSupported) {
    return (
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellOff className="h-4 w-4 text-muted-foreground" />
            {t.pushNotifications}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.pushNotSupported}</p>
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
              {t.pushNotifications}
            </CardTitle>
            <CardDescription className="text-xs">{t.pushRealtimeAlerts}</CardDescription>
          </div>
          <Badge variant={isSubscribed ? "default" : "outline"} className="text-[10px]">
            {isSubscribed ? (
              <><Smartphone className="h-2.5 w-2.5 mr-1" />{t.pushActive}</>
            ) : t.pushInactive}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{t.pushAlertIntro}</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li><strong>{t.pushAlertRunFail}</strong></li>
            <li><strong>{t.pushAlertPlatformRed}</strong></li>
            <li><strong>{t.pushAlertDecision24h}</strong></li>
          </ul>
        </div>

        <div className="flex gap-2">
          {isSubscribed ? (
            <>
              <Button variant="outline" size="sm" onClick={handleUnsubscribe} disabled={isLoading} className="text-xs gap-1.5">
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BellOff className="h-3 w-3" />}
                {t.pushDisable}
              </Button>
              <Button variant="outline" size="sm" onClick={handleTest} disabled={isLoading} className="text-xs gap-1.5">
                <Send className="h-3 w-3" />
                {t.pushTest}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleSubscribe} disabled={isLoading} className="text-xs gap-1.5">
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
              {t.pushEnable}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
