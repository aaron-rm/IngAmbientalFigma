import { RiverStation } from "../data/rivers";

interface Props {
  stations: RiverStation[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  onRefresh: () => void;
}

export default function TopBar({ stations, loading, error, lastFetched, onRefresh }: Props) {
  const emergency = (stations ?? []).filter((r) => r.alert === "emergency");
  const timeStr = lastFetched
    ? lastFetched.toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div className="flex items-center gap-4 px-5 border-b flex-shrink-0" style={{ background: "#fff", borderColor: "#e2e8f0", height: 52 }}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: "#eff6ff" }}>
          💧
        </div>
        <div>
          <span className="font-semibold text-sm" style={{ color: "#1e293b" }}>AlerTa</span>
          <span className="text-sm" style={{ color: "#94a3b8" }}> Panamá</span>
        </div>
      </div>

      <div className="w-px h-5 flex-shrink-0" style={{ background: "#e2e8f0" }} />

      {loading ? (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full blink" style={{ background: "#3b82f6" }} />
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#64748b" }}>CONECTANDO GEOGLOWS…</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full blink" style={{ background: error ? "#f59e0b" : "#22c55e" }} />
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#64748b" }}>
            {error ? "PARCIAL" : "EN VIVO"} · GEOGloWS v2
          </span>
        </div>
      )}

      {emergency.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full flex-shrink-0" style={{ background: "#fef2f2" }}>
          <span style={{ fontSize: 11 }}>⚠️</span>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#dc2626", fontWeight: 500 }}>
            {emergency.length} emergencia{emergency.length > 1 ? "s" : ""} activa{emergency.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {error && (
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#f59e0b" }}>
            {error}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 rounded-md text-xs transition-colors"
          style={{
            fontFamily: "DM Mono, monospace",
            color: "#64748b",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "..." : "↻ actualizar"}
        </button>
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#94a3b8" }}>
          ETESA · SINAPROC · {timeStr}
        </span>
      </div>
    </div>
  );
}
