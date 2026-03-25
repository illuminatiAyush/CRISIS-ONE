"use client";

import React, { useEffect, useState, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import {
  Incident,
  Agency,
} from "@/lib/crisisEngine";

const IncidentMap = dynamic(() => import("./IncidentMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-slate-50 flex items-center justify-center" style={{ height: "calc(100vh - 320px)", minHeight: "500px" }}>
      <div className="flex items-center gap-3 text-slate-500">
        <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" />
        <span className="text-sm font-medium">Loading map engine...</span>
      </div>
    </div>
  )
});

// Severity colors
function getMarkerColor(severity: string): string {
  switch (severity) {
    case "Critical": return "#ef4444";
    case "High": return "#f97316";
    case "Medium": return "#eab308";
    default: return "#22c55e";
  }
}

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAgencies, setShowAgencies] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showClusters, setShowClusters] = useState(true);

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

        <IncidentMap 
          incidents={incidents}
          agencies={agencies}
          showAgencies={showAgencies}
          showZones={showZones}
          showClusters={showClusters}
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
