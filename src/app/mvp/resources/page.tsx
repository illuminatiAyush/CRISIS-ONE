"use client";

import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Icon } from "@iconify/react";
import { Resource, Agency, getResourceStats } from "@/lib/crisisEngine";

// --- Status badge ---
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-600 border-emerald-200",
    deployed: "bg-sky-50 text-sky-600 border-sky-200",
    maintenance: "bg-amber-50 text-amber-600 border-amber-200",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border capitalize ${
        styles[status] || styles.available
      }`}
    >
      {status}
    </span>
  );
}

// --- Type Icon ---
function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    Vehicle: "mdi:truck-outline",
    Equipment: "mdi:wrench-outline",
    Supply: "mdi:package-variant",
    Technology: "mdi:cpu-64-bit",
    Communication: "mdi:radio-tower",
  };
  return <Icon icon={icons[type] || "mdi:help-circle"} className="w-5 h-5" />;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const supabase = getSupabaseClient();

    async function fetchData() {
      const [resRes, agRes] = await Promise.all([
        supabase.from("resources").select("*").order("created_at", { ascending: false }),
        supabase.from("agencies").select("*"),
      ]);
      if (resRes.data) setResources(resRes.data);
      if (agRes.data) setAgencies(agRes.data);
      setLoading(false);
    }

    fetchData();

    // Realtime for resource updates
    const channel = supabase
      .channel("resources-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resources" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setResources((prev) =>
              prev.map((r) =>
                r.id === (payload.new as Resource).id ? (payload.new as Resource) : r
              )
            );
          } else if (payload.eventType === "INSERT") {
            setResources((prev) => [payload.new as Resource, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = getResourceStats(resources);

  const displayed =
    filterStatus === "all"
      ? resources
      : resources.filter((r) => r.status === filterStatus);

  // Toggle status handler
  const handleToggleStatus = async (resource: Resource) => {
    const supabase = getSupabaseClient();
    const next =
      resource.status === "available"
        ? "deployed"
        : resource.status === "deployed"
        ? "available"
        : "available";

    await supabase.from("resources").update({ status: next }).eq("id", resource.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Icon icon="mdi:loading" className="w-10 h-10 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Resource Tracker</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor availability and deployment of emergency resources.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-slate-100">
              <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Units
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Available
          </p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.available}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-sky-50">
              <Icon icon="mdi:truck-fast" className="w-5 h-5 text-sky-500" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Deployed
          </p>
          <p className="text-3xl font-bold text-sky-600 mt-1">{stats.deployed}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-amber-50">
              <Icon icon="mdi:wrench-clock" className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Maintenance
          </p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.maintenance}</p>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">Fleet Utilization</h3>
          <span className="text-xs font-semibold text-slate-500">
            {stats.total > 0
              ? Math.round((stats.deployed / stats.total) * 100)
              : 0}
            % deployed
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-sky-500 h-full transition-all duration-500"
            style={{
              width: `${stats.total > 0 ? (stats.deployed / stats.total) * 100 : 0}%`,
            }}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{
              width: `${
                stats.total > 0 ? (stats.maintenance / stats.total) * 100 : 0
              }%`,
            }}
          />
          <div
            className="bg-emerald-400 h-full transition-all duration-500"
            style={{
              width: `${
                stats.total > 0 ? (stats.available / stats.total) * 100 : 0
              }%`,
            }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Deployed
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Maintenance
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
          </span>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-bold text-slate-800">Resources</h2>
          <div className="flex items-center gap-2">
            {["all", "available", "deployed", "maintenance"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  filterStatus === s
                    ? "bg-sky-50 text-sky-600 ring-1 ring-sky-200"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {displayed.map((resource) => (
            <div
              key={resource.id}
              className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <TypeIcon type={resource.type} />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-800">
                  {resource.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {resource.type} • Qty: {resource.quantity}
                </p>
              </div>

              {/* Status + Action */}
              <StatusBadge status={resource.status} />
              <button
                onClick={() => handleToggleStatus(resource)}
                title={
                  resource.status === "available" ? "Deploy" : "Mark available"
                }
                className={`p-2 rounded-lg transition-colors ${
                  resource.status === "available"
                    ? "bg-sky-50 text-sky-600 hover:bg-sky-100"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                }`}
              >
                <Icon
                  icon={
                    resource.status === "available"
                      ? "mdi:truck-fast-outline"
                      : "mdi:undo"
                  }
                  className="w-4 h-4"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Agencies */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Response Agencies</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Icon icon="mdi:domain" className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 truncate">
                  {agency.name}
                </h3>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <p className="flex items-center gap-1">
                  <Icon icon="mdi:tag" className="w-3.5 h-3.5" />
                  {agency.type}
                </p>
                <p className="flex items-center gap-1">
                  <Icon icon="mdi:account-group" className="w-3.5 h-3.5" />
                  Capacity: {agency.capacity}
                </p>
                {agency.contact && (
                  <p className="flex items-center gap-1">
                    <Icon icon="mdi:phone" className="w-3.5 h-3.5" />
                    {agency.contact}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
