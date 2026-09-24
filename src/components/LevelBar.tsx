import { AlertLevel, alertConfig } from "../data/rivers";

interface Props {
  level: number;
  maxLevel: number;
  normalLevel: number;
  alert: AlertLevel;
}

export default function LevelBar({ level, maxLevel, normalLevel, alert }: Props) {
  const pct = Math.min((level / maxLevel) * 100, 100);
  const normalPct = (normalLevel / maxLevel) * 100;
  const cfg = alertConfig[alert];

  return (
    <div>
      <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: cfg.color }}
        />
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ left: `${normalPct}%`, background: "#cbd5e1" }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: cfg.color, fontWeight: 500 }}>
          {level.toFixed(1)} m
        </span>
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#94a3b8" }}>
          umbral {maxLevel} m
        </span>
      </div>
    </div>
  );
}
