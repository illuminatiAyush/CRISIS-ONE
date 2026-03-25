"use client";

import React, { useEffect, useState, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Icon } from "@iconify/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Incident,
  Agency,
  detectClusters,
} from "@/lib/crisisEngine";

// Severity colors
function getMarkerColor(severity: string): string {
  switch (severity) {
    case "Critical": return "#ef4444";
    case "High": return "#f97316";
    case "Medium": return "#eab308";
    default: return "#22c55e";
  }
}

function getAlertRadiusColor(severity: string): string {
  switch (severity) {
    case "Critical": return "#ef4444";
    case "High": return "#f97316";
    case "Medium": return "#eab308";
    default: return "#22c55e";
  }
}

function createIncidentIcon(severity: string) {
  const color = getMarkerColor(severity);
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px; height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function createAgencyIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(59,130,246,0.4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 14px; font-weight: bold;
    ">A</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function createClusterIcon(count: number) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 40px; height: 40px;
      background: rgba(239,68,68,0.15);
      border: 2px dashed #ef4444;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #ef4444; font-size: 12px; font-weight: 900;
      box-shadow: 0 0 15px rgba(239,68,68,0.2);
    ">${count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAgencies, setShowAgencies] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.LayerGroup[]>([]);

  // Fetch data
  useEffect(() => {
    const supabase = getSupabaseClient();

    async function fetchData() {
      const [incRes, agRes] = await Promise.all([
        supabase.from("incidents").select("*").order("created_at", { ascending: false }),
        supabase.from("agencies").select("*"),
      ]);
      if (incRes.data) setIncidents(incRes.data);
      if (agRes.data) setAgencies(agRes.data);
      setLoading(false);
    }

    fetchData();

    const channel = supabase
      .channel("map-rt-v2")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newInc = payload.new as Incident;
            setIncidents((prev) => [newInc, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setIncidents((prev) =>
              prev.map((i) =>
                i.id === (payload.new as Incident).id ? (payload.new as Incident) : i
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([19.076, 72.877], 11);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render markers when data or toggles change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear all custom layers
    layersRef.current.forEach((lg) => lg.clearLayers());
    layersRef.current = [];

    const incidentLayer = L.layerGroup().addTo(mapRef.current);
    const zoneLayer = L.layerGroup().addTo(mapRef.current);
    const agencyLayer = L.layerGroup().addTo(mapRef.current);
    const clusterLayer = L.layerGroup().addTo(mapRef.current);

    layersRef.current = [incidentLayer, zoneLayer, agencyLayer, clusterLayer];

    // Add incident markers + alert radius zones
    const geoIncidents = incidents.filter((i) => i.lat && i.lng);

    geoIncidents.forEach((incident) => {
      // Marker
      L.marker([incident.lat!, incident.lng!], {
        icon: createIncidentIcon(incident.severity),
      })
        .addTo(incidentLayer)
        .bindPopup(
          `<div style="font-family: system-ui; min-width: 200px;">
            <h3 style="margin:0 0 4px; font-size:14px; font-weight:700;">${incident.title}</h3>
            <p style="margin:0 0 4px; font-size:11px; color:#64748b;">
              ${incident.category} • ${incident.severity} • ${incident.status || "pending"}
            </p>
            ${incident.description ? `<p style="margin:0 0 6px; font-size:11px; color:#94a3b8;">${incident.description}</p>` : ""}
            <div style="display:flex; gap:8px; font-size:10px; color:#94a3b8;">
              <span>📍 ${incident.lat?.toFixed(4)}, ${incident.lng?.toFixed(4)}</span>
              <span>📡 ${incident.alert_radius || 5}km radius</span>
            </div>
          </div>`
        );

      // Alert radius circle
      if (showZones) {
        const radiusKm = (incident.alert_radius || 5) * 1000;
        const color = getAlertRadiusColor(incident.severity);
        L.circle([incident.lat!, incident.lng!], {
          radius: radiusKm,
          color: color,
          fillColor: color,
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: "6 4",
        }).addTo(zoneLayer);
      }
    });

    // Agency markers
    if (showAgencies) {
      agencies.forEach((agency) => {
        L.marker([agency.lat, agency.lng], {
          icon: createAgencyIcon(),
        })
          .addTo(agencyLayer)
          .bindPopup(
            `<div style="font-family: system-ui; min-width: 180px;">
              <h3 style="margin:0 0 4px; font-size:13px; font-weight:700; color:#3b82f6;">${agency.name}</h3>
              <p style="margin:0; font-size:11px; color:#64748b;">
                ${agency.type} • Capacity: ${agency.capacity}
              </p>
              ${agency.contact ? `<p style="margin:4px 0 0; font-size:11px; color:#94a3b8;">📞 ${agency.contact}</p>` : ""}
            </div>`
          );
      });
    }

    // Cluster markers
    if (showClusters) {
      const activeIncidents = incidents.filter((i) => i.status !== "resolved");
      const clusters = detectClusters(activeIncidents);

      clusters.forEach((cluster) => {
        L.marker([cluster.center.lat, cluster.center.lng], {
          icon: createClusterIcon(cluster.count),
        })
          .addTo(clusterLayer)
          .bindPopup(
            `<div style="font-family: system-ui;">
              <h3 style="margin:0 0 4px; font-size:13px; font-weight:700; color:#ef4444;">⚠️ Incident Cluster</h3>
              <p style="margin:0; font-size:11px; color:#64748b;">${cluster.count} incidents concentrated in this zone.</p>
              <p style="margin:4px 0 0; font-size:11px; color:#ef4444; font-weight:600;">High-risk area — consider deploying extra resources.</p>
            </div>`
          );
      });
    }
  }, [incidents, agencies, showAgencies, showZones, showClusters]);

  // Count stats for badges
  const active = incidents.filter((i) => i.status !== "resolved");
  const critical = active.filter((i) => i.severity === "Critical");
  const geoCount = incidents.filter((i) => i.lat && i.lng).length;

  return (
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Intelligence Map
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Incidents, agencies, alert zones & cluster hotspots.
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAgencies(!showAgencies)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showAgencies
                ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                : "bg-white text-slate-400 border border-slate-200"
            }`}
          >
            <Icon icon="mdi:domain" className="w-3.5 h-3.5" />
            Agencies
          </button>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showZones
                ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                : "bg-white text-slate-400 border border-slate-200"
            }`}
          >
            <Icon icon="mdi:radar" className="w-3.5 h-3.5" />
            Alert Zones
          </button>
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showClusters
                ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                : "bg-white text-slate-400 border border-slate-200"
            }`}
          >
            <Icon icon="mdi:chart-bubble" className="w-3.5 h-3.5" />
            Clusters
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-2.5 flex items-center gap-6 flex-wrap">
        <span className="text-xs font-semibold text-slate-500">Legend:</span>
        {["Critical", "High", "Medium", "Low"].map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
              style={{ background: getMarkerColor(s) }}
            />
            <span className="text-xs text-slate-500 font-medium">{s}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500 border-2 border-white shadow-sm" />
          <span className="text-xs text-slate-500 font-medium">Agency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-red-400" />
          <span className="text-xs text-slate-500 font-medium">Cluster</span>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-[999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">Loading intelligence data...</span>
            </div>
          </div>
        )}

        <div
          ref={mapContainerRef}
          className="w-full"
          style={{ height: "calc(100vh - 320px)", minHeight: "500px" }}
        />

        {/* Floating Stats */}
        <div className="absolute bottom-4 left-4 z-[999] flex gap-2">
          <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-slate-100">
            <span className="text-xs font-bold text-slate-700">
              📍 {geoCount} on map
            </span>
          </div>
          {critical.length > 0 && (
            <div className="bg-red-500/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg">
              <span className="text-xs font-bold text-white">
                🔥 {critical.length} critical
              </span>
            </div>
          )}
          <div className="bg-blue-500/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg">
            <span className="text-xs font-bold text-white">
              🏢 {agencies.length} agencies
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
