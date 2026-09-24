import { useState, useEffect } from "react";
import { RiverStation, AlertLevel, STATIONS } from "../data/rivers";

const BASE = "https://geoglows.ecmwf.int/api/v2";

interface ReturnPeriods {
  rp2: number;
  rp5: number;
  rp10: number;
  rp25: number;
  rp50: number;
  rp100: number;
}

interface ForecastResponse {
  reach_id: number;
  datetime: string[];
  flow_median?: number[];
  streamflow_median?: number[];
  // v2 may use different key names
  [key: string]: unknown;
}

interface ReturnPeriodsResponse {
  reach_id?: number;
  return_period_2?: number;
  return_period_5?: number;
  return_period_10?: number;
  return_period_25?: number;
  return_period_50?: number;
  return_period_100?: number;
  rp2?: number;
  rp5?: number;
  rp10?: number;
  rp25?: number;
  rp50?: number;
  rp100?: number;
}

function parseReturnPeriods(data: ReturnPeriodsResponse): ReturnPeriods {
  return {
    rp2:  data.return_period_2  ?? data.rp2  ?? 0,
    rp5:  data.return_period_5  ?? data.rp5  ?? 0,
    rp10: data.return_period_10 ?? data.rp10 ?? 0,
    rp25: data.return_period_25 ?? data.rp25 ?? 0,
    rp50: data.return_period_50 ?? data.rp50 ?? 0,
    rp100:data.return_period_100?? data.rp100?? 0,
  };
}

function parseFlow(data: ForecastResponse): number[] {
  if (Array.isArray(data.flow_median)) return data.flow_median as number[];
  if (Array.isArray(data.streamflow_median)) return data.streamflow_median as number[];
  // Try to find any array of numbers
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "number") return val as number[];
  }
  return [];
}

function alertFromFlow(flow: number, rp: ReturnPeriods): AlertLevel {
  if (flow >= rp.rp25) return "emergency";
  if (flow >= rp.rp10) return "warning";
  if (flow >= rp.rp2)  return "watch";
  return "normal";
}

function trendFromSeries(flows: number[]): "rising" | "falling" | "stable" {
  if (flows.length < 4) return "stable";
  const recent = flows.slice(0, 4);
  const diff = recent[0] - recent[3];
  if (diff > recent[3] * 0.05) return "rising";
  if (diff < -recent[3] * 0.05) return "falling";
  return "stable";
}

async function fetchStation(
  reachId: number,
  base: Omit<RiverStation, "level" | "maxLevel" | "normalLevel" | "flow" | "trend" | "alert" | "lastUpdate" | "rainfall24h">
): Promise<RiverStation> {
  const [forecastRes, rpRes] = await Promise.all([
    fetch(`${BASE}/forecast/${reachId}`, { headers: { Accept: "application/json" } }),
    fetch(`${BASE}/returnperiods/${reachId}`, { headers: { Accept: "application/json" } }),
  ]);

  if (!forecastRes.ok || !rpRes.ok) throw new Error(`API error for ${reachId}`);

  const forecast: ForecastResponse = await forecastRes.json();
  const rpRaw: ReturnPeriodsResponse = await rpRes.json();

  const rp = parseReturnPeriods(rpRaw);
  const flows = parseFlow(forecast);
  const currentFlow = flows[0] ?? 0;
  const alert = alertFromFlow(currentFlow, rp);
  const trend = trendFromSeries(flows);

  const now = new Date();
  const lastUpdate = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return {
    ...base,
    flow: Math.round(currentFlow),
    level: +(currentFlow / 100).toFixed(1), // approximate level from flow
    maxLevel: +(rp.rp10 / 100).toFixed(1),
    normalLevel: +(rp.rp2 / 200).toFixed(1),
    alert,
    trend,
    lastUpdate,
    rainfall24h: 0,
  };
}

export interface GEOGloWSResult {
  stations: RiverStation[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}

function makeFallback(): RiverStation[] {
  // One entry per station in STATIONS (28 total). Values are illustrative until API responds.
  const data: Array<{ level: number; maxLevel: number; normalLevel: number; flow: number; trend: "rising" | "falling" | "stable"; alert: AlertLevel; rainfall24h: number }> = [
    // Panamá / Canal
    { level: 8.4,  maxLevel: 10.0, normalLevel: 5.5, flow: 1240, trend: "rising",  alert: "warning",   rainfall24h: 112 },
    { level: 12.1, maxLevel: 14.0, normalLevel: 7.0, flow: 1800, trend: "rising",  alert: "watch",     rainfall24h:  98 },
    { level: 4.2,  maxLevel: 8.0,  normalLevel: 2.8, flow:  340, trend: "stable",  alert: "normal",    rainfall24h:  30 },
    { level: 3.1,  maxLevel: 7.0,  normalLevel: 2.0, flow:  210, trend: "stable",  alert: "normal",    rainfall24h:  22 },
    { level: 6.9,  maxLevel: 7.0,  normalLevel: 3.4, flow:  610, trend: "rising",  alert: "emergency", rainfall24h: 145 },
    { level: 2.8,  maxLevel: 6.0,  normalLevel: 1.8, flow:  190, trend: "stable",  alert: "normal",    rainfall24h:  18 },
    { level: 5.5,  maxLevel: 9.0,  normalLevel: 3.2, flow:  520, trend: "rising",  alert: "watch",     rainfall24h:  74 },
    { level: 2.2,  maxLevel: 6.5,  normalLevel: 1.5, flow:  160, trend: "falling", alert: "normal",    rainfall24h:  15 },
    // Panamá Este / Darién
    { level: 11.8, maxLevel: 11.5, normalLevel: 6.2, flow: 2100, trend: "rising",  alert: "emergency", rainfall24h: 198 },
    { level: 9.6,  maxLevel: 12.0, normalLevel: 5.8, flow: 3400, trend: "rising",  alert: "warning",   rainfall24h: 167 },
    { level: 6.1,  maxLevel: 10.0, normalLevel: 4.0, flow:  880, trend: "stable",  alert: "watch",     rainfall24h:  65 },
    { level: 4.8,  maxLevel: 9.0,  normalLevel: 3.1, flow:  560, trend: "stable",  alert: "normal",    rainfall24h:  40 },
    { level: 3.9,  maxLevel: 8.0,  normalLevel: 2.6, flow:  420, trend: "falling", alert: "normal",    rainfall24h:  28 },
    // Coclé
    { level: 2.9,  maxLevel: 7.5,  normalLevel: 2.2, flow:  180, trend: "stable",  alert: "normal",    rainfall24h:  18 },
    { level: 3.4,  maxLevel: 8.0,  normalLevel: 2.5, flow:  240, trend: "rising",  alert: "normal",    rainfall24h:  35 },
    { level: 2.5,  maxLevel: 6.0,  normalLevel: 1.8, flow:  140, trend: "stable",  alert: "normal",    rainfall24h:  20 },
    // Herrera / Los Santos
    { level: 5.2,  maxLevel: 8.0,  normalLevel: 3.1, flow:  430, trend: "stable",  alert: "watch",     rainfall24h:  54 },
    { level: 4.1,  maxLevel: 7.5,  normalLevel: 2.8, flow:  310, trend: "falling", alert: "normal",    rainfall24h:  38 },
    // Veraguas
    { level: 3.8,  maxLevel: 8.5,  normalLevel: 2.6, flow:  290, trend: "stable",  alert: "normal",    rainfall24h:  32 },
    { level: 4.2,  maxLevel: 9.0,  normalLevel: 2.9, flow:  350, trend: "rising",  alert: "normal",    rainfall24h:  44 },
    { level: 5.6,  maxLevel: 8.0,  normalLevel: 3.5, flow:  490, trend: "rising",  alert: "watch",     rainfall24h:  62 },
    { level: 3.2,  maxLevel: 7.0,  normalLevel: 2.1, flow:  210, trend: "stable",  alert: "normal",    rainfall24h:  25 },
    // Chiriquí
    { level: 3.8,  maxLevel: 9.0,  normalLevel: 2.5, flow:  280, trend: "falling", alert: "normal",    rainfall24h:  22 },
    { level: 4.5,  maxLevel: 8.5,  normalLevel: 3.0, flow:  380, trend: "stable",  alert: "normal",    rainfall24h:  30 },
    { level: 6.2,  maxLevel: 9.0,  normalLevel: 3.8, flow:  520, trend: "rising",  alert: "watch",     rainfall24h:  78 },
    // Bocas del Toro
    { level: 7.8,  maxLevel: 10.0, normalLevel: 4.5, flow:  940, trend: "rising",  alert: "warning",   rainfall24h: 130 },
    { level: 5.9,  maxLevel: 9.5,  normalLevel: 3.8, flow:  680, trend: "rising",  alert: "watch",     rainfall24h:  92 },
    { level: 4.3,  maxLevel: 8.0,  normalLevel: 2.9, flow:  370, trend: "stable",  alert: "normal",    rainfall24h:  45 },
  ];

  return STATIONS.map((s, i) => ({
    ...s,
    ...(data[i] ?? { level: 3.0, maxLevel: 8.0, normalLevel: 2.0, flow: 200, trend: "stable" as const, alert: "normal" as AlertLevel, rainfall24h: 20 }),
    lastUpdate: "--:--",
  }));
}

export function useGEOGloWS(): GEOGloWSResult {
  const [stations, setStations] = useState<RiverStation[]>(() => makeFallback());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fallback = makeFallback();
    Promise.allSettled(STATIONS.map((s) => fetchStation(s.reachId, s))).then((results) => {
      if (cancelled) return;
      const loaded: RiverStation[] = results.map((r, i) => {
        if (r.status === "fulfilled") return r.value;
        return fallback[i];
      });
      const anyError = results.some((r) => r.status === "rejected");
      setStations(loaded);
      setError(anyError ? "Algunas estaciones no pudieron conectarse a GEOGloWS." : null);
      setLastFetched(new Date());
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [tick]);

  return { stations, loading, error, lastFetched, refresh: () => setTick((t) => t + 1) };
}
