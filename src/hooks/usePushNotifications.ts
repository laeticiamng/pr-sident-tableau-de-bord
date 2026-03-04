import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | "unsupported";
  isLoading: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: "unsupported",
    isLoading: true,
  });

  // Check support and current state
  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (!supported) {
      setState({ isSupported: false, isSubscribed: false, permission: "unsupported", isLoading: false });
      return;
    }

    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setState({
          isSupported: true,
          isSubscribed: !!subscription,
          permission: Notification.permission,
          isLoading: false,
        });
      } catch {
        setState({ isSupported: true, isSubscribed: false, permission: Notification.permission, isLoading: false });
      }
    })();
  }, []);

  // Get VAPID public key from edge function
  const getVapidPublicKey = useCallback(async (): Promise<string | null> => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/send-push-notification`,
        { method: "GET" }
      );
      if (!resp.ok) return null;
      const { publicKey } = await resp.json();
      return publicKey;
    } catch (e) {
      logger.error("Failed to get VAPID key:", e);
      return null;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      setState((s) => ({ ...s, isLoading: true }));

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((s) => ({ ...s, permission, isLoading: false }));
        return false;
      }

      // Get VAPID key
      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) throw new Error("Impossible de récupérer la clé VAPID");

      // Convert VAPID key to Uint8Array
      const padding = "=".repeat((4 - (vapidKey.length % 4)) % 4);
      const base64 = (vapidKey + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = atob(base64);
      const applicationServerKey = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) applicationServerKey[i] = rawData.charCodeAt(i);

      // Subscribe via Push API
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Extract keys
      const subJson = subscription.toJSON();
      const p256dh = subJson.keys?.p256dh || "";
      const authKey = subJson.keys?.auth || "";

      // Save to database
      await supabase.rpc("save_push_subscription", {
        p_endpoint: subscription.endpoint,
        p_p256dh: p256dh,
        p_auth_key: authKey,
        p_user_agent: navigator.userAgent,
        p_device_label: getDeviceLabel(),
      });

      setState({ isSupported: true, isSubscribed: true, permission: "granted", isLoading: false });
      logger.info("[Push] Subscription saved successfully");
      return true;
    } catch (e) {
      logger.error("[Push] Subscribe failed:", e);
      setState((s) => ({ ...s, isLoading: false }));
      return false;
    }
  }, [state.isSupported, getVapidPublicKey]);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    try {
      setState((s) => ({ ...s, isLoading: true }));
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await supabase.rpc("remove_push_subscription", { p_endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }

      setState((s) => ({ ...s, isSubscribed: false, isLoading: false }));
      return true;
    } catch (e) {
      logger.error("[Push] Unsubscribe failed:", e);
      setState((s) => ({ ...s, isLoading: false }));
      return false;
    }
  }, []);

  // Send test notification
  const sendTest = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase.functions.invoke("send-push-notification", {
      body: {
        title: "🔔 Test — HQ Notifications",
        message: "Les notifications push fonctionnent correctement !",
        urgency: "low",
        type: "test",
      },
    });

    return !error;
  }, []);

  return { ...state, subscribe, unsubscribe, sendTest };
}

function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "Appareil";
}
