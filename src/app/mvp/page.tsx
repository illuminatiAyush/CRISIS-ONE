"use client";

import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import {
  Incident,
  Agency,
  DecisionInsight,
  computePriorityScore,
  sortByPriority,
  findBestAgency,
  generateInsights,
} from "@/lib/crisisEngine";

// --- Stat Card ---
function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  accent,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  bgColor: string;
  accent?: string;
}) {
  return (
    <div
      className={`${
        accent || "bg-white"
      } rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <Icon icon={icon} className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {title}
      </p>
      <p
        className={`text-3xl font-bold mt-1 ${
          accent ? "text-white" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// --- Severity Badge ---
function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Critical: "bg-red-50 text-red-600 border-red-200",
    High: "bg-orange-50 text-orange-600 border-orange-200",
    Medium: "bg-amber-50 text-amber-600 border-amber-200",
    Low: "bg-green-50 text-green-600 border-green-200",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
        styles[severity] || styles.Low
      }`}
    >
      {severity}
    </span>
  );
}

// --- Insight Card ---
function InsightCard({ insight }: { insight: DecisionInsight }) {
  const styles = {
    danger: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-sky-50 border-sky-200 text-sky-800",
  };
  const iconBg = {
    danger: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-600",
    info: "bg-sky-100 text-sky-600",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${styles[insight.type]} flex items-start gap-3`}
    >
      <div className={`p-2 rounded-lg shrink-0 ${iconBg[insight.type]}`}>
        <Icon icon={insight.icon} className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-bold">{insight.title}</h4>
        <p className="text-xs mt-1 opacity-80 leading-relaxed">
          {insight.message}
        </p>
      </div>
    </div>
  );
}

// --- Main Dashboard ---
export default function MVPDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    async function fetchData() {
      const [incRes, agRes] = await Promise.all([
        supabase
          .from("incidents")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("agencies").select("*"),
      ]);

      if (incRes.data) setIncidents(incRes.data);
      if (agRes.data) setAgencies(agRes.data);
      setLoading(false);
    }

    fetchData();

    // Realtime
    const channel = supabase
      .channel("dashboard-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setIncidents((prev) => [payload.new as Incident, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setIncidents((prev) =>
              prev.map((i) =>
                i.id === (payload.new as Incident).id
                  ? (payload.new as Incident)
                  : i
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

  // Derived stats
  const active = incidents.filter((i) => i.status !== "resolved");
  const critical = active.filter((i) => i.severity === "Critical");
  const pending = active.filter((i) => i.status === "pending");
  const resolved = incidents.filter((i) => i.status === "resolved");
  const sorted = sortByPriority(active);
  const insights = generateInsights(incidents, agencies);

  // Auto-assign handler
  const handleAutoAssign = async (incident: Incident) => {
    const best = findBestAgency(incident, agencies);
    if (!best) return;

    const supabase = getSupabaseClient();
    const score = computePriorityScore(incident.severity, incident.created_at);

    await supabase
      .from("incidents")
      .update({
        assigned_agency_id: best.id,
        status: "active",
        priority_score: score,
      })
      .eq("id", incident.id);
  };

  // Resolve handler
  const handleResolve = async (id: string) => {
    const supabase = getSupabaseClient();
    await supabase
      .from("incidents")
      .update({ status: "resolved" })
      .eq("id", id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Icon
          icon="mdi:loading"
          className="w-10 h-10 text-sky-400 animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Command Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time crisis intelligence & decision support
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              pending.forEach((inc) => handleAutoAssign(inc));
            }}
            disabled={pending.length === 0}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            <Icon icon="mdi:robot-outline" className="w-4 h-4" />
            Auto-Assign All ({pending.length})
          </button>
          <Link
            href="/mvp/report"
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Icon icon="mdi:plus" className="w-4 h-4" />
            Report
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active"
          value={active.length}
          icon="mdi:alert-circle-outline"
          color="text-white"
          bgColor="bg-sky-500"
          accent="bg-gradient-to-br from-sky-500 to-blue-600 border-sky-400"
        />
        <StatCard
          title="Critical"
          value={critical.length}
          icon="mdi:fire"
          color="text-red-500"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Pending"
          value={pending.length}
          icon="mdi:clock-outline"
          color="text-amber-500"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Resolved"
          value={resolved.length}
          icon="mdi:check-circle-outline"
          color="text-emerald-500"
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Agencies"
          value={agencies.length}
          icon="mdi:domain"
          color="text-violet-500"
          bgColor="bg-violet-50"
        />
      </div>

      {/* Two Column: Decision Support + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Decision Support Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="mdi:brain" className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-bold text-slate-800">
              Decision Support
            </h2>
          </div>

          {insights.length === 0 ? (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <Icon
                icon="mdi:shield-check"
                className="w-8 h-8 text-slate-300 mx-auto mb-2"
              />
              <p className="text-sm text-slate-400">
                No action items at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          )}
        </div>

        {/* Incident Feed */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Priority Feed
              </h2>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                LIVE
              </span>
            </div>

            {sorted.length === 0 ? (
              <div className="p-12 text-center">
                <Icon
                  icon="mdi:shield-check"
                  className="w-12 h-12 text-emerald-300 mx-auto mb-3"
                />
                <p className="text-slate-500 font-medium">All Clear</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sorted.slice(0, 15).map((incident) => {
                  const score = computePriorityScore(
                    incident.severity,
                    incident.created_at
                  );
                  const assignedAgency = agencies.find(
                    (a) => a.id === incident.assigned_agency_id
                  );

                  return (
                    <div
                      key={incident.id}
                      className="px-6 py-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Priority Score */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
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

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-slate-800 truncate">
                              {incident.title}
                            </h3>
                            <SeverityBadge severity={incident.severity} />
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                incident.status === "resolved"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : incident.status === "active"
                                  ? "bg-sky-50 text-sky-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {incident.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 truncate">
                            {incident.category}
                            {assignedAgency
                              ? ` → ${assignedAgency.name}`
                              : " → Unassigned"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {!incident.assigned_agency_id && (
                            <button
                              onClick={() => handleAutoAssign(incident)}
                              title="Auto-assign agency"
                              className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                            >
                              <Icon
                                icon="mdi:robot-outline"
                                className="w-4 h-4"
                              />
                            </button>
                          )}
                          {incident.status !== "resolved" && (
                            <button
                              onClick={() => handleResolve(incident.id)}
                              title="Mark resolved"
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            >
                              <Icon
                                icon="mdi:check-circle-outline"
                                className="w-4 h-4"
                              />
                            </button>
                          )}
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(incident.created_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
