import { User } from "../store/auth";
import { RiverStation, alertConfig } from "../data/rivers";

interface Props {
  user: User;
  stations: RiverStation[];
  isSubscribed: (id: string) => boolean;
  onToggle: (id: string) => void;
  onLogout: () => void;
  notificationCount: number;
}

export default function ProfileScreen({ user, stations, isSubscribed, onToggle, onLogout, notificationCount }: Props) {
  const subscribed = stations.filter((s) => isSubscribed(s.id));

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "#f8fafc" }}>
      {/* User card */}
      <div className="mx-4 mt-6 mb-4 rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: "#eff6ff", color: "#3b82f6" }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base truncate" style={{ color: "#1e293b" }}>{user.name}</div>
            <div className="text-sm truncate" style={{ color: "#64748b" }}>{user.email}</div>
            {user.phone && <div className="text-sm" style={{ color: "#94a3b8" }}>{user.phone}</div>}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="flex-1 rounded-xl p-3 text-center" style={{ background: "#f8fafc" }}>
            <div className="text-xl font-bold" style={{ color: "#3b82f6" }}>{notificationCount}</div>
            <div className="text-xs mt-0.5" style={{ color: "#94a3b8", fontFamily: "DM Mono, monospace" }}>ALERTAS ACTIVAS</div>
          </div>
          <div className="flex-1 rounded-xl p-3 text-center" style={{ background: "#f8fafc" }}>
            <div className="text-xl font-bold" style={{ color: "#1e293b" }}>{stations.length}</div>
            <div className="text-xs mt-0.5" style={{ color: "#94a3b8", fontFamily: "DM Mono, monospace" }}>ESTACIONES</div>
          </div>
        </div>
      </div>

      {/* Subscribed rivers */}
      <div className="px-4 mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8", fontFamily: "DM Mono, monospace" }}>
          Mis alertas
        </div>
      </div>

      <div className="mx-4 rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid #e2e8f0", background: "#fff" }}>
        {subscribed.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <div className="text-2xl mb-2">🔕</div>
            <div className="text-sm font-medium" style={{ color: "#1e293b" }}>Sin alertas configuradas</div>
            <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>Ve a la pestaña Ríos y activa notificaciones</div>
          </div>
        ) : (
          subscribed.map((station, i) => {
            const cfg = alertConfig[station.alert];
            return (
              <div key={station.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < subscribed.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#1e293b" }}>{station.river}</div>
                  <div className="text-xs" style={{ color: "#94a3b8" }}>{station.province}</div>
                </div>
                <button
                  onClick={() => onToggle(station.id)}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                >
                  Quitar
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Settings section */}
      <div className="px-4 mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8", fontFamily: "DM Mono, monospace" }}>
          Configuración
        </div>
      </div>

      <div className="mx-4 rounded-2xl overflow-hidden mb-6" style={{ border: "1px solid #e2e8f0", background: "#fff" }}>
        {[
          { icon: "📧", label: "Alertas por correo", sub: user.email },
          { icon: "📱", label: "Alertas por SMS", sub: user.phone || "No configurado" },
          { icon: "🇵🇦", label: "País", sub: "Panamá" },
          { icon: "📡", label: "Fuente de datos", sub: "GEOGloWS v2 · ETESA" },
        ].map(({ icon, label, sub }, i) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
            <span className="text-lg w-7 text-center">{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: "#1e293b" }}>{label}</div>
              <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-8">
        <button onClick={onLogout}
          className="w-full py-3.5 rounded-xl text-sm font-medium"
          style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#64748b" }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
