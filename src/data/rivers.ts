export type AlertLevel = "normal" | "watch" | "warning" | "emergency";

export interface RiverStation {
  id: string;
  name: string;
  river: string;
  province: string;
  lat: number;
  lng: number;
  reachId: number;
  level: number;
  maxLevel: number;
  normalLevel: number;
  flow: number;
  trend: "rising" | "falling" | "stable";
  alert: AlertLevel;
  lastUpdate: string;
  rainfall24h: number;
}

export const PANAMA_CENTER: [number, number] = [8.4, -80.1];

// Coordinates sourced from ETESA/ANAM hydrological station registry.
// reachId values are TDXHydro reach IDs (GEOGloWS v2 network).
export const STATIONS: Omit<RiverStation, "level" | "maxLevel" | "normalLevel" | "flow" | "trend" | "alert" | "lastUpdate" | "rainfall24h">[] = [
  // ── Panamá / Canal ────────────────────────────────────────────────────────
  { id: "chagres-gamboa",      name: "Gamboa",        river: "Río Chagres",         province: "Panamá",        lat:  9.1183, lng: -79.6970, reachId: 9029395 },
  { id: "chagres-alhajuela",   name: "Alhajuela",     river: "Río Chagres",         province: "Panamá",        lat:  9.2050, lng: -79.5960, reachId: 9029402 },
  { id: "gatun",               name: "Gatún",         river: "Río Gatún",           province: "Colón",         lat:  9.2730, lng: -79.9220, reachId: 9029500 },
  { id: "indio",               name: "Escobal",       river: "Río Indio",           province: "Colón",         lat:  9.1500, lng: -80.3200, reachId: 9028800 },
  { id: "pacora",              name: "Pacora",        river: "Río Pacora",          province: "Panamá",        lat:  9.0660, lng: -79.2760, reachId: 9030100 },
  { id: "juan-diaz",           name: "Pedregal",      river: "Río Juan Díaz",       province: "Panamá",        lat:  9.0050, lng: -79.4700, reachId: 9030210 },
  { id: "chepo",               name: "Chepo",         river: "Río Mamoni / Chepo",  province: "Panamá",        lat:  9.1680, lng: -79.1000, reachId: 9030900 },
  { id: "capira",              name: "La Ermita",     river: "Río Capira",          province: "Panamá Oeste",  lat:  8.7550, lng: -79.8900, reachId: 9031000 },

  // ── Panamá Este / Darién ──────────────────────────────────────────────────
  { id: "bayano-maje",         name: "Majé",          river: "Río Bayano",          province: "Panamá Este",   lat:  9.0050, lng: -78.6200, reachId: 9031205 },
  { id: "tuira-el-real",       name: "El Real",       river: "Río Tuira",           province: "Darién",        lat:  8.1200, lng: -77.7300, reachId: 9022011 },
  { id: "sambu",               name: "La Palma",      river: "Río Sambú",           province: "Darién",        lat:  7.9300, lng: -78.0200, reachId: 9021500 },
  { id: "pirre",               name: "El Salto",      river: "Río Pirre",           province: "Darién",        lat:  7.8800, lng: -77.8500, reachId: 9021200 },
  { id: "balsas",              name: "Balsas",        river: "Río Balsas",          province: "Darién",        lat:  7.7800, lng: -77.9200, reachId: 9021100 },

  // ── Coclé ─────────────────────────────────────────────────────────────────
  { id: "cocle-norte",         name: "Penonomé",      river: "Río Coclé del Norte", province: "Coclé",         lat:  8.5210, lng: -80.3540, reachId: 9037200 },
  { id: "grande-cocle",        name: "El Copé",       river: "Río Grande",          province: "Coclé",         lat:  8.6200, lng: -80.6200, reachId: 9037000 },
  { id: "anton",               name: "Antón",         river: "Río Antón",           province: "Coclé",         lat:  8.3980, lng: -80.2660, reachId: 9036900 },

  // ── Herrera / Los Santos ──────────────────────────────────────────────────
  { id: "santa-maria-villa",   name: "La Villa",      river: "Río Santa María",     province: "Herrera",       lat:  7.9700, lng: -80.4200, reachId: 9041111 },
  { id: "la-villa-los-santos", name: "Los Santos",    river: "Río La Villa",        province: "Los Santos",    lat:  7.9400, lng: -80.4100, reachId: 9041200 },

  // ── Veraguas ──────────────────────────────────────────────────────────────
  { id: "san-pablo",           name: "Soná",          river: "Río San Pablo",       province: "Veraguas",      lat:  8.0100, lng: -81.3200, reachId: 9044500 },
  { id: "calovebora",          name: "Santa Fe",      river: "Río Calovébora",      province: "Veraguas",      lat:  8.5100, lng: -81.0600, reachId: 9044000 },
  { id: "tabasara",            name: "Mariato",       river: "Río Tabasará",        province: "Veraguas",      lat:  7.9000, lng: -81.0500, reachId: 9043800 },
  { id: "fonseca",             name: "Atalaya",       river: "Río Fonseca",         province: "Veraguas",      lat:  7.8500, lng: -80.8000, reachId: 9042800 },

  // ── Chiriquí ──────────────────────────────────────────────────────────────
  { id: "chiriqui-david",      name: "David",         river: "Río Chiriquí",        province: "Chiriquí",      lat:  8.4300, lng: -82.4300, reachId: 9055890 },
  { id: "chiriqui-viejo",      name: "Volcán",        river: "Río Chiriquí Viejo",  province: "Chiriquí",      lat:  8.7700, lng: -82.6400, reachId: 9056500 },
  { id: "caldera",             name: "Boquete",       river: "Río Caldera",         province: "Chiriquí",      lat:  8.7780, lng: -82.4400, reachId: 9056100 },

  // ── Bocas del Toro ────────────────────────────────────────────────────────
  { id: "changuinola",         name: "Changuinola",   river: "Río Changuinola",     province: "Bocas del Toro",lat:  9.4330, lng: -82.5200, reachId: 9060200 },
  { id: "teribe",              name: "Changuinola II",river: "Río Teribe",          province: "Bocas del Toro",lat:  9.0700, lng: -82.1500, reachId: 9060400 },
  { id: "cricamola",           name: "Almirante",     river: "Río Cricamola",       province: "Bocas del Toro",lat:  9.2900, lng: -82.4000, reachId: 9060100 },
];

export const alertConfig: Record<AlertLevel, { label: string; color: string; bg: string; border: string }> = {
  normal:    { label: "Normal",      color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  watch:     { label: "Vigilancia",  color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
  warning:   { label: "Advertencia", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  emergency: { label: "Emergencia",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};
