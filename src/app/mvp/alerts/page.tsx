"use client";

import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Icon } from "@iconify/react";
import {
  Incident,
  getIncidentsNearby,
  isInAlertZone,
  computePriorityScore,
} from "@/lib/crisisEngine";

type FilterType = "all" | "Critical" | "High" | "Medium" | "Low";

export default function AlertsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radius, setRadius] = useState(10);
  const [geoMode, setGeoMode] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default to Mumbai center if denied
          setUserLocation({ lat: 19.076, lng: 72.877 });
        }
      );
    }
  }, []);

  // Fetch incidents
  useEffect(() => {
    const supabase = getSupabaseClient();

    async function fetch() {
      const { data } = await supabase
        .from("incidents")
        .select("*")
        .neq("status", "resolved")
        .order("created_at", { ascending: false });
      if (data) setIncidents(data);
      setLoading(false);
    }
    fetch();

    const channel = supabase
      .channel("alerts-rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        (payload) => {
          const newInc = payload.new as Incident;
          setIncidents((prev) => [newInc, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter logic
  let displayed = incidents;

  // Geo filter
  if (geoMode && userLocation) {
    displayed = getIncidentsNearby(
      displayed,
      userLocation.lat,
      userLocation.lng,
      radius
    );
  }

  // Severity filter
  if (filter !== "all") {
    displayed = displayed.filter((i) => i.severity === filter);
  }

  // Sort by priority
  displayed = [...displayed].sort((a, b) => {
    return (
      computePriorityScore(b.severity, b.created_at) -
      computePriorityScore(a.severity, a.created_at)
    );
  });

  const filterButtons: { value: FilterType; label: string; color: string }[] = [
    { value: "all", label: "All", color: "bg-slate-100 text-slate-700" },
    { value: "Critical", label: "Critical", color: "bg-red-50 text-red-600" },
    { value: "High", label: "High", color: "bg-orange-50 text-orange-600" },
    { value: "Medium", label: "Medium", color: "bg-amber-50 text-amber-600" },
    { value: "Low", label: "Low", color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Geo-Targeted Alerts
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time alerts filtered by severity and proximity to your location.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Severity Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterButtons.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f.value
                  ? f.color + " ring-1 ring-current/20 shadow-sm"
                  : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Geo Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGeoMode(!geoMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              geoMode
                ? "bg-sky-50 text-sky-600 ring-1 ring-sky-200"
                : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Icon icon="mdi:crosshairs-gps" className="w-3.5 h-3.5" />
            Nearby
          </button>

          {geoMode && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-24 h-1 accent-sky-500"
              />
              <span className="text-xs font-semibold text-slate-600 w-12">
                {radius} km
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400 font-medium px-1">
        Showing {displayed.length} alert{displayed.length !== 1 ? "s" : ""}
        {geoMode ? ` within ${radius}km` : ""}
      </p>

      {/* Alert Cards */}
      {loading ? (
        <div className="py-16 text-center">
          <Icon
            icon="mdi:loading"
            className="w-8 h-8 text-sky-400 animate-spin mx-auto"
          />
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-100">
          <Icon
            icon="mdi:bell-off-outline"
            className="w-12 h-12 text-slate-300 mx-auto mb-3"
          />
          <p className="text-slate-500 font-medium">No alerts match</p>
          <p className="text-slate-400 text-sm mt-1">
            Try adjusting filters or radius.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((incident) => {
            const score = computePriorityScore(
              incident.severity,
              incident.created_at
            );
            const inAlertZone =
              userLocation &&
              isInAlertZone(incident, userLocation.lat, userLocation.lng);

            return (
              <div
                key={incident.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md ${
                  incident.severity === "Critical"
                    ? "border-red-200 ring-1 ring-red-100"
                    : "border-slate-100"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Priority badge */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black ${
                        score >= 80
                          ? "bg-red-500 text-white"
                          : score >= 60
                          ? "bg-orange-400 text-white"
                          : score >= 40
                          ? "bg-amber-400 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {score}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {incident.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {incident.category} •{" "}
                        {new Date(incident.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {inAlertZone && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                        IN ZONE
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        incident.severity === "Critical"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : incident.severity === "High"
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : incident.severity === "Medium"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-green-50 text-green-600 border-green-200"
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </div>
                </div>

                {incident.description && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                    {incident.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:map-marker" className="w-3.5 h-3.5" />
                    {incident.lat?.toFixed(3)}, {incident.lng?.toFixed(3)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:radar" className="w-3.5 h-3.5" />
                    {incident.alert_radius || 5} km radius
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
