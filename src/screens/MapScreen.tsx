import { useState, useEffect } from "react";
import { alertConfig, RiverStation } from "../data/rivers";
import PanamaMap from "../components/PanamaMap";

interface Props {
  stations: RiverStation[];
  loading: boolean;
}

export default function MapScreen({ stations, loading }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => { setMapLoaded(true); }, []);

  const emergency = stations.filter((s) => s.alert === "emergency");

  return (
    <div className="flex flex-col h-full" style={{ background: "#f8fafc" }}>
      {/* Alert banner */}
      {emergency.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0" style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
          <span className="blink" style={{ fontSize: 14 }}>⚠️</span>
          <span className="text-xs font-medium" style={{ color: "#dc2626" }}>
            {emergency.length} emergencia{emergency.length > 1 ? "s" : ""} activa{emergency.length > 1 ? "s" : ""} — {emergency.map(s => s.river).join(", ")}
          </span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {mapLoaded && <PanamaMap stations={stations} selected={selected} onSelect={setSelected} />}
        {loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full text-xs flex items-center gap-2"
            style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", color: "#64748b", fontFamily: "DM Mono, monospace" }}>
            <span className="blink" style={{ color: "#3b82f6" }}>●</span> Conectando GEOGloWS…
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-3 z-[1000] p-3 rounded-xl"
          style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          {(["emergency", "warning", "watch", "normal"] as const).map((lvl) => {
            const cfg = alertConfig[lvl];
            const labels = { emergency: "Emergencia", warning: "Advertencia", watch: "Vigilancia", normal: "Normal" };
            return (
              <div key={lvl} className="flex items-center gap-2 mb-1 last:mb-0">
                <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#475569" }}>{labels[lvl]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
