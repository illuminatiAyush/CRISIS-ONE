"use client";

import React, { useEffect, useState, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
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

export default function IncidentMap({
  incidents,
  agencies,
  showAgencies,
  showZones,
  showClusters
}: {
  incidents: Incident[];
  agencies: Agency[];
  showAgencies: boolean;
  showZones: boolean;
  showClusters: boolean;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.LayerGroup[]>([]);

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

  return (
    <div
      ref={mapContainerRef}
      className="w-full"
      style={{ height: "calc(100vh - 320px)", minHeight: "500px" }}
    />
  );
}
