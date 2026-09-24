import { AlertLevel, alertConfig } from "../data/rivers";

export default function AlertBadge({ level, pulse }: { level: AlertLevel; pulse?: boolean }) {
  const cfg = alertConfig[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium tracking-wide rounded-full"
      style={{
        fontFamily: "DM Mono, monospace",
        color: cfg.color,
        background: cfg.bg,
        fontSize: 10,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pulse && level === "emergency" ? "blink" : ""}`}
        style={{ background: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}
