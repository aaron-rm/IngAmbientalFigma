import { MapContainer, TileLayer, CircleMarker, Popup, useMap, GeoJSON } from "react-leaflet";
import { useEffect, useRef } from "react";
import type { Layer, PathOptions } from "leaflet";
import { RiverStation, alertConfig, PANAMA_CENTER } from "../data/rivers";
import { usePanamaRivers, RiverFeature } from "../hooks/usePanamaRivers";
import AlertBadge from "./AlertBadge";
import LevelBar from "./LevelBar";

function FitBounds() {
  const map = useMap();
  useEffect(() => { map.setView(PANAMA_CENTER, 7); }, [map]);
  return null;
}

function riverStyle(feature?: { properties?: { waterway?: string } }): PathOptions {
  const isCanal = feature?.properties?.waterway === "canal";
  return {
    color: isCanal ? "#93c5fd" : "#3b82f6",
    weight: isCanal ? 1 : 1.5,
    opacity: isCanal ? 0.4 : 0.55,
    fillOpacity: 0,
  };
}

function RiverLayer() {
  const { geojson, loading } = usePanamaRivers();
  const keyRef = useRef(0);

  if (loading || !geojson) return null;

  keyRef.current += 1;

  return (
    <GeoJSON
      key={keyRef.current}
      data={geojson as GeoJSON.GeoJsonObject}
      style={(feature) => riverStyle(feature as { properties?: { waterway?: string } })}
      onEachFeature={(feature: GeoJSON.Feature, layer: Layer) => {
        const name = (feature as RiverFeature).properties?.name;
        if (name) layer.bindTooltip(name, { sticky: true, className: "river-tooltip" });
      }}
    />
  );
}

interface Props {
  stations: RiverStation[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function PanamaMap({ stations, selected, onSelect }: Props) {
  return (
    <MapContainer center={PANAMA_CENTER} zoom={7} style={{ width: "100%", height: "100%" }} zoomControl>
      <FitBounds />
      <TileLayer
        url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        subdomains="0123"
        attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
        maxZoom={20}
      />

      <RiverLayer />

      {stations.map((station) => {
        const cfg = alertConfig[station.alert];
        const isSelected = selected === station.id;
        const radius = station.alert === "emergency" ? 12 : station.alert === "warning" ? 9 : 7;

        return (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lng]}
            radius={isSelected ? radius + 3 : radius}
            pathOptions={{
              color: "#fff",
              fillColor: cfg.color,
              fillOpacity: isSelected ? 1 : 0.85,
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{ click: () => onSelect(station.id) }}
          >
            <Popup>
              <div style={{ minWidth: 220, fontFamily: "Outfit, sans-serif" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{station.province}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>{station.river}</div>
                <div style={{ marginBottom: 8 }}>
                  <AlertBadge level={station.alert} pulse />
                </div>
                <LevelBar level={station.level} maxLevel={station.maxLevel} normalLevel={station.normalLevel} alert={station.alert} />
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ background: "#f8fafc", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "DM Mono, monospace", marginBottom: 2 }}>CAUDAL</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#1e293b", fontFamily: "DM Mono, monospace" }}>{station.flow.toLocaleString()} m³/s</div>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "DM Mono, monospace", marginBottom: 2 }}>ESTACIÓN</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#1e293b", fontFamily: "DM Mono, monospace" }}>{station.name}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: "#94a3b8", fontFamily: "DM Mono, monospace" }}>
                  {station.lat.toFixed(4)}, {station.lng.toFixed(4)} · {station.lastUpdate}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
