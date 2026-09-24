import { useEffect, useRef } from "react";
import { RiverStation } from "../data/rivers";
import { showLocalAlert } from "../lib/notifications";

/**
 * Envía una notificación local (push-free) la primera vez que un río
 * suscrito entra en "warning" o "emergency" en un refresco de datos.
 * No repite la notificación si el río se mantiene en el mismo nivel.
 */
export function useFloodAlerts(stations: RiverStation[], isSubscribed: (id: string) => boolean) {
  const lastAlert = useRef<Record<string, string>>({});

  useEffect(() => {
    for (const s of stations) {
      const prev = lastAlert.current[s.id];
      if (isSubscribed(s.id) && (s.alert === "warning" || s.alert === "emergency") && prev !== s.alert) {
        showLocalAlert(
          s.alert === "emergency" ? `🚨 Emergencia: ${s.river}` : `⚠️ Advertencia: ${s.river}`,
          `Nivel actual ${s.level.toFixed(1)} m en ${s.name}, ${s.province}.`,
          `river-${s.id}`
        );
      }
      lastAlert.current[s.id] = s.alert;
    }
  }, [stations, isSubscribed]);
}
