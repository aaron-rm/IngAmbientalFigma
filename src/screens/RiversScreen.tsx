import { useState } from "react";
import { RiverStation, AlertLevel, alertConfig } from "../data/rivers";
import AlertBadge from "../components/AlertBadge";
import LevelBar from "../components/LevelBar";

function TrendArrow({ trend }: { trend: "rising" | "falling" | "stable" }) {
  if (trend === "rising") return <span style={{ color: "#dc2626", fontSize: 11 }}>▲</span>;
  if (trend === "falling") return <span style={{ color: "#16a34a", fontSize: 11 }}>▼</span>;
  return <span style={{ color: "#94a3b8", fontSize: 11 }}>─</span>;
}

function NotifButton({ subscribed, onClick }: { subscribed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
      style={{
        background: subscribed ? "#eff6ff" : "#f1f5f9",
        color: subscribed ? "#2563eb" : "#64748b",
        border: `1px solid ${subscribed ? "#bfdbfe" : "#e2e8f0"}`,
      }}
    >
      <span style={{ fontSize: 13 }}>{subscribed ? "🔔" : "🔕"}</span>
      {subscribed ? "Activo" : "Notificar"}
    </button>
  );
}

function StationSheet({ station, subscribed, onToggle, onClose }: {
  station: RiverStation;
  subscribed: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const cfg = alertConfig[station.alert];
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.3)" }} onClick={onClose}>
      <div className="rounded-t-2xl p-5" style={{ background: "#fff" }} onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "#e2e8f0" }} />

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs mb-1" style={{ fontFamily: "DM Mono, monospace", color: "#94a3b8" }}>{station.province}</div>
            <div className="text-lg font-bold" style={{ color: "#1e293b" }}>{station.river}</div>
            <div className="text-sm" style={{ color: "#64748b" }}>Estación {station.name}</div>
          </div>
          <AlertBadge level={station.alert} pulse={station.alert === "emergency"} />
        </div>

        <LevelBar level={station.level} maxLevel={station.maxLevel} normalLevel={station.normalLevel} alert={station.alert} />

        <div className="grid grid-cols-3 gap-2 mt-4 mb-5">
          {[
            { label: "NIVEL", value: `${station.level.toFixed(1)} m`, color: cfg.color },
            { label: "CAUDAL", value: `${station.flow.toLocaleString()} m³/s` },
            { label: "LLUVIA 24H", value: `${station.rainfall24h} mm` },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: "#f8fafc" }}>
              <div style={{ fontFamily: "DM Mono, monospace", fontSize: 9, color: "#94a3b8", marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, fontWeight: 600, color: color ?? "#1e293b" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Notification toggle */}
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4"
          style={{ background: subscribed ? "#eff6ff" : "#f8fafc", border: `1px solid ${subscribed ? "#bfdbfe" : "#e2e8f0"}` }}>
          <div>
            <div className="text-sm font-medium" style={{ color: "#1e293b" }}>Alertas de inundación</div>
            <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              {subscribed ? "Recibirás notificaciones cuando suba el nivel" : "Activa para recibir alertas de este río"}
            </div>
          </div>
          <button
            onClick={onToggle}
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{ background: subscribed ? "#3b82f6" : "#e2e8f0" }}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: subscribed ? "calc(100% - 22px)" : 2 }} />
          </button>
        </div>

        <div className="text-center text-xs" style={{ fontFamily: "DM Mono, monospace", color: "#cbd5e1" }}>
          Actualizado {station.lastUpdate} · GEOGloWS v2
        </div>
      </div>
    </div>
  );
}

interface Props {
  stations: RiverStation[];
  isSubscribed: (id: string) => boolean;
  onToggle: (id: string) => void;
  user: { name: string } | null;
}

export default function RiversScreen({ stations, isSubscribed, onToggle, user }: Props) {
  const [filter, setFilter] = useState<AlertLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<RiverStation | null>(null);

  const list = stations ?? [];
  const filtered = list
    .filter((s) => filter === "all" || s.alert === filter)
    .filter((s) => !search || s.river.toLowerCase().includes(search.toLowerCase()) || s.province.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    emergency: list.filter((s) => s.alert === "emergency").length,
    warning:   list.filter((s) => s.alert === "warning").length,
    watch:     list.filter((s) => s.alert === "watch").length,
    normal:    list.filter((s) => s.alert === "normal").length,
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
        <div className="text-lg font-bold mb-3" style={{ color: "#1e293b" }}>Ríos de Panamá</div>

        {/* Search */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#94a3b8" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar río o provincia…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#1e293b", fontFamily: "Outfit, sans-serif", outline: "none" }}
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setFilter("all")}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: filter === "all" ? "#1e293b" : "#f1f5f9", color: filter === "all" ? "#fff" : "#64748b" }}
          >
            Todos ({list.length})
          </button>
          {(["emergency", "warning", "watch", "normal"] as AlertLevel[]).map((lvl) => {
            const cfg = alertConfig[lvl];
            const active = filter === lvl;
            return (
              <button key={lvl} onClick={() => setFilter(active ? "all" : lvl)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: active ? cfg.bg : "#f1f5f9", color: active ? cfg.color : "#64748b",
                  border: active ? `1px solid ${cfg.border}` : "1px solid transparent" }}>
                {cfg.label} ({counts[lvl]})
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((station) => {
          const cfg = alertConfig[station.alert];
          const sub = isSubscribed(station.id);
          return (
            <button key={station.id} onClick={() => setDetail(station)}
              className="w-full text-left px-4 py-4 transition-colors"
              style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: "#1e293b" }}>{station.river}</div>
                  <div className="text-xs" style={{ color: "#94a3b8" }}>{station.name} · {station.province}</div>
                </div>
                <AlertBadge level={station.alert} pulse={station.alert === "emergency"} />
              </div>

              <div className="mb-3">
                <LevelBar level={station.level} maxLevel={station.maxLevel} normalLevel={station.normalLevel} alert={station.alert} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 15, fontWeight: 600, color: cfg.color }}>
                    {station.level.toFixed(1)}<span style={{ fontSize: 10, color: "#94a3b8" }}>m</span>
                  </span>
                  <TrendArrow trend={station.trend} />
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#94a3b8" }}>
                    {station.flow.toLocaleString()} m³/s
                  </span>
                </div>
                <NotifButton subscribed={sub} onClick={() => {
                  if (!user) return;
                  onToggle(station.id);
                }} />
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="text-3xl mb-3">🔍</div>
            <div className="text-sm font-medium" style={{ color: "#1e293b" }}>Sin resultados</div>
            <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>Intenta con otro nombre o provincia</div>
          </div>
        )}
      </div>

      {/* Detail sheet */}
      {detail && (
        <StationSheet
          station={detail}
          subscribed={isSubscribed(detail.id)}
          onToggle={() => {
            if (user) onToggle(detail.id);
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}
