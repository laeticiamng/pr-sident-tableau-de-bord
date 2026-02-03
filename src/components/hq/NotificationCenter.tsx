import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRealtimeNotifications, RealtimeNotification } from "@/hooks/useRealtimeNotifications";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useRealtimeNotifications();

  const getNotificationIcon = (type: RealtimeNotification["type"]) => {
    switch (type) {
      case "approval_required":
        return <Bell className="h-4 w-4 text-warning" />;
      case "approval_resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "run_completed":
        return <Sparkles className="h-4 w-4 text-accent" />;
      case "system":
        return <Info className="h-4 w-4 text-primary" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: RealtimeNotification["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "bg-destructive/10 border-destructive/30";
      case "high":
        return "bg-warning/10 border-warning/30";
      case "medium":
        return "bg-primary/10 border-primary/30";
      case "low":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 animate-pulse" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          {/* Connection indicator */}
          <Circle
            className={cn(
              "absolute bottom-0 right-0 h-2 w-2 fill-current",
              isConnected ? "text-success" : "text-destructive"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={markAllAsRead}
                title="Tout marquer comme lu"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={clearNotifications}
                title="Effacer tout"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
              <p className="text-xs mt-1">
                {isConnected ? "Temps réel actif" : "Connexion en cours..."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 p-2 rounded-lg border",
                        getUrgencyColor(notification.urgency)
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <Circle className="h-2 w-2 fill-primary text-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <p className="text-xs text-center text-muted-foreground">
            <Circle
              className={cn(
                "inline h-2 w-2 mr-1 fill-current",
                isConnected ? "text-success" : "text-destructive"
              )}
            />
            {isConnected ? "Temps réel connecté" : "Reconnexion..."}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
