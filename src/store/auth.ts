import { useState } from "react";
import { requestNotificationPermission } from "../lib/notifications";

export interface User {
  name: string;
  email: string;
  phone: string;
}

const STORAGE_KEY = "alerta_user";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(u: User | null) {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEY);
}

const NOTIF_KEY = "alerta_notifications";

function loadNotifs(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifs(s: Set<string>) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify([...s]));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(loadUser);
  const [notifications, setNotifications] = useState<Set<string>>(loadNotifs);

  function register(data: User) {
    saveUser(data);
    setUser(data);
  }

  function logout() {
    saveUser(null);
    setUser(null);
  }

  function toggleNotification(riverId: string) {
    setNotifications((prev) => {
      const next = new Set(prev);
      const adding = !next.has(riverId);
      if (adding) next.add(riverId);
      else next.delete(riverId);
      saveNotifs(next);
      if (adding) requestNotificationPermission();
      return next;
    });
  }

  function isSubscribed(riverId: string) {
    return notifications.has(riverId);
  }

  return { user, register, logout, toggleNotification, isSubscribed, notificationCount: notifications.size };
}
