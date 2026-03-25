'use client';

/**
 * Crisis Dashboard - 4G Grid Layout (Bento Style)
 * Features: 4-Column Stats, Interactive Map Grid, and Real-time Feeds
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useIncidents } from '@/app/hooks/useIncidents';
import { useResources } from '@/app/hooks/useResources';
import { useAlerts } from '@/app/hooks/useAlerts';
import { useDashboardStats } from '@/app/hooks/useDashboardStats';
import { Incident } from '@/app/types';
import Map from './Map';
import IncidentReportForm from './IncidentReportForm';

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, color, iconBg, trend, onClick, customColor, textDesign }: any) {
  return (
    <motion.div
      whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className={`${customColor || 'bg-white'} p-6 rounded-3xl   border-slate-100 shadow-lg transition-all cursor-pointer relative overflow-hidden group`}
    >
      <div className="flex justify-between  items-start mb-4">
        <div className={`p-3 rounded-full ${iconBg || 'bg-slate-100'} ${color}`}>
          <Icon icon={icon} className="w-7 h-7" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/60 backdrop-blur-md flex items-center gap-1 ${trend > 0 ? 'text-green-700' : 'text-red-700'}`}>
            <Icon icon={trend > 0 ? "mdi:arrow-up" : "mdi:arrow-down"} className="w-3 h-3" />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <h3 className={` ${textDesign} text-slate-800  text-lg font-medium mb-1 font-text`}>{title}</h3>
        <p className={` ${textDesign} text-4xl  font-bold text-[#1B2559] tracking-tight`}>{value}</p>
      </div>
    </motion.div>
  );
}

function IncidentRow({ incident }: { incident: Incident }) {
  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'Critical': return 'bg-red-50 text-red-600 border-red-100';
      case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
      {/* Status Dot */}
      <div className={`w-2 h-2 rounded-full ring-2 ring-white shadow-sm shrink-0 ${incident.status === 'Resolved' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />

      {/* User Avatar (Static for now) */}
      <img
        src={`https://i.pravatar.cc/150?u=${incident.id}`}
        alt="Reporter"
        className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-sm font-semibold text-slate-800 truncate">{incident.category}</h4>
          <span className="text-[10px] text-slate-400 font-medium">{new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{incident.description}</p>
      </div>
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${getSeverityColor(incident.severity)}`}>
        {incident.severity}
      </span>
    </div>
  );
}

// --- MAIN DASHBOARD COMPONENT ---

export default function CrisisDashboard() {
  const { filteredIncidents, loading } = useIncidents();
  const { filteredResources, getUtilizationRate } = useResources();
  const { alerts, unacknowledgedCount } = useAlerts();
  const { stats } = useDashboardStats();
  const [showReportForm, setShowReportForm] = useState(false);

  // Metrics
  const activeIncidents = filteredIncidents.filter(i => i.status !== 'Resolved');
  const criticalCount = activeIncidents.filter(i => i.severity === 'Critical').length;
  const activeResources = filteredResources.filter(r => r.status !== 'Available').length;
  const avgUtilization = filteredResources.length > 0
    ? Math.round(filteredResources.reduce((acc, r) => acc + getUtilizationRate(r), 0) / filteredResources.length)
    : 0;

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">

      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-text text-[#1B2559]">Details of Mumbai</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">here you can track the incidents and resources in your city</p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => setShowReportForm(true)}
            className="px-4 py-2 border-slate-200 text-white bg-[#0EA5E9] rounded-lg text-sm font-medium hover:bg-slate-600  shadow-lg shadow-slate-200 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Icon icon="mdi:alert-plus " className="w-4 h-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* 2. STATS GRID (Colored Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Incidents"
          value={stats ? stats.totalActiveIncidents : '-'}
          icon="mdi:alert-circle-outline"
          color="text-white"
          textDesign="text-white"
          iconBg="bg-[#0EA5E9]/10"
          customColor="bg-[#0EA5E9]/80"
          trend={12}
        />
        <StatCard
          title="Critical Incidents"
          value={stats ? stats.totalCriticalIncidents : '-'}
          icon="mdi:fire"
          color="text-[#0EA5E9]"
          iconBg="bg-[#0EA5E9]/10"
          trend={-5}
        />
        <StatCard
          title="Total Agencies"
          value={stats ? stats.totalAgencies : '-'}
          icon="mdi:domain"
          color="text-[#0EA5E9]"
          iconBg="bg-[#0EA5E9]/10"
          customColor="bg-white"
          trend={8}
        />
        <StatCard
          title="Total Volunteers"
          value={stats ? stats.totalVolunteers : '-'}
          icon="mdi:account-group"
          color="text-[#0EA5E9]"
          iconBg="bg-[#0EA5E9]/10"
          customColor="bg-white"
          trend={2}
        />
      </div>

      {/* 3. BENTO GRID (Main Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[700px]">

        {/* LEFT COLUMN: Map (Hero - Spans 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px] lg:h-full relative group hover:shadow-md transition-shadow duration-300 z-0">

          <div className="flex-1 w-full h-full z-0">
            <Map
              incidents={filteredIncidents}
              resources={filteredResources}
              height="100%"
              className="h-full w-full z-0"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Feeds (Spans 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-[600px]">

          {/* CREATIVE SECTION 1: ALERT CARDS */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end px-1">
              <h3 className="font-bold text-[#1B2559] text-lg font-text">Live Alerts</h3>
              <span className="text-xs font-bold text-[#0EA5E9] bg-sky-50 px-2 py-1 rounded-lg">LIVE FEED</span>
            </div>

            <div className="space-y-3">
              {filteredIncidents.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                  All clear. No active incidents.
                </div>
              ) : (
                filteredIncidents.slice(0, 4).map((incident, index) => (
                  <motion.div
                    key={incident.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* User Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={`https://i.pravatar.cc/150?u=${incident.id}`}
                          alt="User"
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white ${incident.severity === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-sky-50 text-sky-500'}`}>
                          <Icon icon={incident.severity === 'Critical' ? 'mdi:alert-circle' : 'mdi:bell'} className="w-3 h-3" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{incident.category}</h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{incident.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${incident.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Incident Report Modal */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <IncidentReportForm
                onSubmit={() => setShowReportForm(false)}
                onCancel={() => setShowReportForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}