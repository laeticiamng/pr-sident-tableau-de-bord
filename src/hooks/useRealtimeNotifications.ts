import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeNotification {
  id: string;
  type: "approval_required" | "approval_resolved" | "alert" | "run_completed" | "system";
  title: string;
  message: string;
  urgency: "low" | "medium" | "high" | "critical";
  data?: Record<string, unknown>;
  timestamp: Date;
  read: boolean;
}

interface UseRealtimeNotificationsOptions {
  enabled?: boolean;
  showToasts?: boolean;
}

export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions = {}) {
  const { enabled = true, showToasts = true } = options;
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const addNotification = useCallback((notification: Omit<RealtimeNotification, "id" | "timestamp" | "read">) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));

    if (showToasts) {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.urgency === "critical" || notification.urgency === "high" ? "destructive" : "default",
      });
    }

    // Play sound for urgent notifications
    if (notification.urgency === "critical" || notification.urgency === "high") {
      playNotificationSound();
    }

    return newNotification;
  }, [showToasts, toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to HQ events channel
    const realtimeChannel = supabase
      .channel("hq-notifications")
      .on("broadcast", { event: "approval_required" }, (payload) => {
        addNotification({
          type: "approval_required",
          title: "🔔 Approbation Requise",
          message: payload.payload?.title || "Une nouvelle action nécessite votre approbation",
          urgency: (payload.payload?.risk_level as "low" | "medium" | "high" | "critical") || "medium",
          data: payload.payload,
        });
      })
      .on("broadcast", { event: "run_completed" }, (payload) => {
        addNotification({
          type: "run_completed",
          title: "✅ Run Terminé",
          message: payload.payload?.run_type?.replace(/_/g, " ") || "Un run IA a été complété",
          urgency: "low",
          data: payload.payload,
        });
      })
      .on("broadcast", { event: "alert" }, (payload) => {
        addNotification({
          type: "alert",
          title: "⚠️ Alerte Système",
          message: payload.payload?.message || "Une alerte a été déclenchée",
          urgency: payload.payload?.urgency || "high",
          data: payload.payload,
        });
      })
      .on("broadcast", { event: "system" }, (payload) => {
        addNotification({
          type: "system",
          title: "ℹ️ Notification Système",
          message: payload.payload?.message || "Notification système",
          urgency: "low",
          data: payload.payload,
        });
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        console.debug("[Realtime] Channel status:", status);
      });

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [enabled, addNotification]);

  // Function to broadcast a notification (for testing or triggering from UI)
  const broadcast = useCallback(
    async (event: string, payload: Record<string, unknown>) => {
      if (!channel) return;
      
      await channel.send({
        type: "broadcast",
        event,
        payload,
      });
    },
    [channel]
  );

  return {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    broadcast,
  };
}

// Simple notification sound using Web Audio API
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
}
