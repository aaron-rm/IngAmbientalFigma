import { useState } from "react";
import { RiverStation, AlertLevel, alertConfig } from "../data/rivers";
import AlertBadge from "./AlertBadge";
import LevelBar from "./LevelBar";

function TrendArrow({ trend }: { trend: "rising" | "falling" | "stable" }) {
  if (trend === "rising") return <span style={{ color: "#dc2626", fontSize: 10 }}>▲</span>;
  if (trend === "falling") return <span style={{ color: "#16a34a", fontSize: 10 }}>▼</span>;
  return <span style={{ color: "#94a3b8", fontSize: 10 }}>─</span>;
}

function StationCard({ station, selected, onClick }: { station: RiverStation; selected: boolean; onClick: () => void }) {
  const cfg = alertConfig[station.alert];
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 transition-colors"
      style={{
        background: selected ? "#f8fafc" : "#fff",
        borderBottom: "1px solid #f1f5f9",
        borderLeft: `3px solid ${selected ? cfg.color : "transparent"}`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: "#1e293b" }}>{station.river}</div>
          <div className="text-xs" style={{ color: "#94a3b8" }}>{station.name} · {station.province}</div>
        </div>
        <AlertBadge level={station.alert} pulse={station.alert === "emergency"} />
      </div>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 16, fontWeight: 600, color: cfg.color }}>
          {station.level.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>m</span>
        </span>
        <TrendArrow trend={station.trend} />
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#94a3b8" }}>
          {station.flow.toLocaleString()} m³/s
        </span>
        <span className="ml-auto" style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#cbd5e1" }}>
          {station.lastUpdate}
        </span>
      </div>
    </button>
  );
}

function DetailPanel({ station }: { station: RiverStation }) {
  const cfg = alertConfig[station.alert];
  return (
    <div className="px-4 py-4 border-b" style={{ borderColor: "#f1f5f9", background: "#f8fafc" }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs mb-0.5" style={{ fontFamily: "DM Mono, monospace", color: "#94a3b8", letterSpacing: "0.06em" }}>ESTACIÓN ACTIVA</div>
          <div className="text-sm font-semibold" style={{ color: "#1e293b" }}>{station.river}</div>
          <div className="text-xs" style={{ color: "#94a3b8" }}>{station.name} · {station.province}</div>
        </div>
        <AlertBadge level={station.alert} pulse />
      </div>

      <LevelBar level={station.level} maxLevel={station.maxLevel} normalLevel={station.normalLevel} alert={station.alert} />

      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: "CAUDAL", value: `${station.flow.toLocaleString()}`, unit: "m³/s" },
          { label: "LLUVIA", value: `${station.rainfall24h}`, unit: "mm/24h" },
          { label: "NORMAL", value: `${station.normalLevel.toFixed(1)}`, unit: "m" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="rounded-lg p-2.5" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 9, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
              {value}<span style={{ fontSize: 9, color: "#94a3b8", marginLeft: 2 }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  stations: RiverStation[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function Sidebar({ stations, selected, onSelect }: Props) {
  const [filter, setFilter] = useState<AlertLevel | "all">("all");

  const list = stations ?? [];
  const selectedStation = list.find((s) => s.id === selected);
  const filtered = filter === "all" ? list : list.filter((s) => s.alert === filter);

  const counts = {
    emergency: list.filter((s) => s.alert === "emergency").length,
    warning:   list.filter((s) => s.alert === "warning").length,
    watch:     list.filter((s) => s.alert === "watch").length,
    normal:    list.filter((s) => s.alert === "normal").length,
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#fff" }}>
      {/* Alert summary */}
      <div className="grid grid-cols-4 border-b flex-shrink-0" style={{ borderColor: "#f1f5f9" }}>
        {(["emergency", "warning", "watch", "normal"] as AlertLevel[]).map((lvl) => {
          const cfg = alertConfig[lvl];
          const active = filter === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setFilter(active ? "all" : lvl)}
              className="py-3 text-center transition-colors"
              style={{
                borderRight: "1px solid #f1f5f9",
                background: active ? cfg.bg : "transparent",
              }}
            >
              <div style={{ fontFamily: "DM Mono, monospace", fontSize: 18, fontWeight: 600, color: active ? cfg.color : "#1e293b" }}>
                {counts[lvl]}
              </div>
              <div style={{ fontSize: 9, color: active ? cfg.color : "#94a3b8", marginTop: 1, fontFamily: "DM Mono, monospace", letterSpacing: "0.05em" }}>
                {cfg.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected detail */}
      {selectedStation && <DetailPanel station={selectedStation} />}

      {/* List header */}
      <div className="px-4 py-2 border-b flex-shrink-0" style={{ borderColor: "#f1f5f9" }}>
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#cbd5e1", letterSpacing: "0.1em" }}>
          {filtered.length} ESTACIONES
        </span>
      </div>

      {/* Station list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            selected={selected === station.id}
            onClick={() => onSelect(station.id)}
          />
        ))}
      </div>
    </div>
  );
}
