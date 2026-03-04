// Push notification handler for the service worker
// This file is loaded by the PWA service worker

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "HQ Alert", body: event.data.text() };
  }

  const options = {
    body: data.body || "",
    icon: data.icon || "/pwa-icon-192.png",
    badge: data.badge || "/pwa-icon-192.png",
    tag: data.tag || "hq-alert",
    vibrate: [200, 100, 200],
    data: data.data || { url: "/hq" },
    actions: [
      { action: "open", title: "Ouvrir HQ" },
      { action: "dismiss", title: "Ignorer" },
    ],
    requireInteraction: data.data?.urgency === "critical" || data.data?.urgency === "high",
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/hq";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes("/hq") && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
