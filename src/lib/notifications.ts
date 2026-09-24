export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

export async function showLocalAlert(title: string, body: string, tag: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (reg?.active) {
    reg.active.postMessage({ type: "SHOW_ALERT", payload: { title, body, tag } });
  } else {
    new Notification(title, { body, tag });
  }
}
