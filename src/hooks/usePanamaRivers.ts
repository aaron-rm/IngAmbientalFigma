import { useState, useEffect } from "react";
import type { GeoJSON as GeoJSONType } from "leaflet";

// Overpass query: all named waterways (river + canal) within Panama's boundary
const OVERPASS_QUERY = `
[out:json][timeout:90];
area["ISO3166-1"="PA"]->.panama;
(
  way["waterway"~"^(river|canal)$"]["name"](area.panama);
  relation["waterway"~"^(river|canal)$"]["name"](area.panama);
);
out geom;
`.trim();

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const CACHE_KEY = "panama_rivers_geojson_v1";

export interface RiverFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: {
    name: string;
    waterway: string;
    id: number;
  };
}

export interface RiversGeoJSON {
  type: "FeatureCollection";
  features: RiverFeature[];
}

function overpassToGeoJSON(elements: OverpassElement[]): RiversGeoJSON {
  const features: RiverFeature[] = [];

  for (const el of elements) {
    if (el.type === "way" && el.geometry && el.geometry.length >= 2) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: el.geometry.map((pt) => [pt.lon, pt.lat]),
        },
        properties: {
          name: el.tags?.name ?? "",
          waterway: el.tags?.waterway ?? "river",
          id: el.id,
        },
      });
    }
    // Relations come back as grouped members — skip for now, ways cover most coverage
  }

  return { type: "FeatureCollection", features };
}

interface OverpassElement {
  type: "way" | "relation" | "node";
  id: number;
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export function usePanamaRivers() {
  const [geojson, setGeojson] = useState<RiversGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try sessionStorage cache first to avoid re-fetching on hot reload
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setGeojson(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }

    const ctrl = new AbortController();

    fetch(OVERPASS_URL, {
      method: "POST",
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Overpass ${r.status}`);
        return r.json() as Promise<OverpassResponse>;
      })
      .then((data) => {
        const gj = overpassToGeoJSON(data.elements);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(gj));
        setGeojson(gj);
        setLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setError("No se pudieron cargar los ríos.");
        setLoading(false);
      });

    return () => ctrl.abort();
  }, []);

  return { geojson, loading, error };
}
