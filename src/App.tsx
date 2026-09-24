import { useState } from "react";
import { useGEOGloWS } from "./hooks/useGEOGloWS";
import { useFloodAlerts } from "./hooks/useFloodAlerts";
import { useAuth } from "./store/auth";
import AuthScreen from "./screens/AuthScreen";
import MapScreen from "./screens/MapScreen";
import RiversScreen from "./screens/RiversScreen";
import ProfileScreen from "./screens/ProfileScreen";

type Tab = "map" | "rivers" | "profile";

function TabBar({ active, onChange, notifCount, loggedIn }: { active: Tab; onChange: (t: Tab) => void; notifCount: number; loggedIn: boolean }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "map",     label: "Mapa",   icon: "🗺️" },
    { id: "rivers",  label: "Ríos",   icon: "💧" },
    { id: "profile", label: loggedIn ? "Perfil" : "Ingresar", icon: loggedIn ? "👤" : "🔑" },
  ];

  return (
    <div className="flex-shrink-0 flex border-t" style={{ background: "#fff", borderColor: "#f1f5f9", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors relative"
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
          <span className="text-xs font-medium" style={{ color: active === t.id ? "#3b82f6" : "#94a3b8" }}>
            {t.label}
          </span>
          {t.id === "profile" && notifCount > 0 && (
            <span className="absolute top-2 right-1/4 w-4 h-4 rounded-full text-white flex items-center justify-center"
              style={{ background: "#ef4444", fontSize: 9, fontFamily: "DM Mono, monospace", fontWeight: 700 }}>
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
          {active === t.id && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ background: "#3b82f6" }} />
          )}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("map");
  const { stations, loading, error, refresh } = useGEOGloWS();
  const { user, register, logout, toggleNotification, isSubscribed, notificationCount } = useAuth();

  // Dispara notificaciones locales cuando un río suscrito sube a advertencia/emergencia
  useFloodAlerts(stations, isSubscribed);

  return (
    <div className="flex flex-col w-full h-full" style={{ maxWidth: 430, margin: "0 auto", background: "#f8fafc" }}>
      {/* Status bar area */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
        <div className="flex items-center gap-2">
          <span className="text-base">💧</span>
          <span className="font-bold text-sm" style={{ color: "#1e293b" }}>AlerTa Panamá</span>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="blink" style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#3b82f6" }}>CARGANDO…</span>
          ) : error ? (
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#f59e0b" }}>PARCIAL</span>
          ) : (
            <span className="flex items-center gap-1" style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#16a34a" }}>
              <span className="w-1.5 h-1.5 rounded-full blink" style={{ background: "#16a34a", display: "inline-block" }} />
              EN VIVO
            </span>
          )}
          <button onClick={refresh} style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1 }}>↻</button>
        </div>
      </div>

      {/* Screen */}
      <div className="flex-1 overflow-hidden">
        {tab === "map" && <MapScreen stations={stations} loading={loading} />}
        {tab === "rivers" && (
          <RiversScreen
            stations={stations}
            isSubscribed={isSubscribed}
            onToggle={toggleNotification}
            user={user}
          />
        )}
        {tab === "profile" && (
          user
            ? <ProfileScreen
                user={user}
                stations={stations}
                isSubscribed={isSubscribed}
                onToggle={toggleNotification}
                onLogout={logout}
                notificationCount={notificationCount}
              />
            : <AuthScreen onRegister={register} />
        )}
      </div>

      <TabBar active={tab} onChange={setTab} notifCount={notificationCount} loggedIn={!!user} />
    </div>
  );
}
