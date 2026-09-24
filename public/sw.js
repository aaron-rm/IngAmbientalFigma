const CACHE = "alerta-panama-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first para el app shell, network-first con fallback a cache para el resto.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return; // no interceptar APIs externas (GEOGloWS, Overpass, Google Maps)

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Notificación local disparada desde la app (sin backend push), ej. cuando
// un río suscrito sube a advertencia/emergencia.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_ALERT") {
    const { title, body, tag, icon } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: icon || "/icons/icon-192.svg",
      badge: "/icons/icon-192.svg",
      vibrate: [100, 50, 100],
    });
  }
});

// Soporte para push real (VAPID) el día que exista un backend que lo envíe.
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "AlerTa Panamá", {
      body: data.body || "Nueva alerta de inundación",
      icon: "/icons/icon-192.svg",
      badge: "/icons/icon-192.svg",
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
