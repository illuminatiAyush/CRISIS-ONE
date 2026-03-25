'use client';

/**
 * Analytics Dashboard - Executive Summary View
 * Features: High-level KPI cards, split-panel detailed analysis, and clean professional aesthetic.
 * Theme: Blue/Slate (60-30-10)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AnalyticsData } from '@/app/types';
import { analyticsService } from '@/app/services/mockDataService';
import IncidentDensityGrid from './IncidentDensityGrid';

// --- VISUAL CONSTANTS ---
const COLORS = {
  primary: '#0EA5E9',   // Sky 500
  secondary: '#64748B', // Slate 500
  accent: '#3B82F6',    // Blue 500
  success: '#10B981',   // Emerald 500
  warning: '#F59E0B',   // Amber 500
  danger: '#EF4444',    // Red 500
  background: '#F8FAFC', // Slate 50
  card: '#FFFFFF',
  text: '#0F172A'       // Slate 900
};

// --- COMPONENT: KPI CARD ---
function KpiCard({ title, value, label, trend, icon }: any) {
  return (
    <div className=" p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full hover:border-[#0EA5E9]/30 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-slate-100 text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors">
          <Icon icon={icon} className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-lg font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <Icon icon={trend > 0 ? "mdi:arrow-up" : "mdi:arrow-down"} className="w-3.5 h-3.5" />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <h4 className="text-5xl font-bold text-slate-800 tracking-tight">{value}</h4>
        <p className="text-sm text-slate-500 font-semibold mt-1.5 uppercase tracking-wide">{title}</p>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Simulating data fetch
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [timeRange]);

  if (loading) return (
    <div className="h-[600px] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Icon icon="mdi:loading" className="w-10 h-10 text-[#0EA5E9] animate-spin mb-3" />
        <p className="text-slate-400 text-base font-medium">Gathering intelligence...</p>
      </div>
    </div>
  );

  if (!data) return null;

  // Transform Data
  const chartData = data.incidentsOverTime.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    value: d.count
  }));

  const severityData = Object.entries(data.incidentSeverityDistribution).map(([name, value]) => ({ name, value }));
  const categoryData = Object.entries(data.incidentsByCategory).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-sm p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="font-bold mb-1.5">{label}</p>
          <p className="font-medium">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-[1600px] mx-auto p-2"
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#1B2559] font-display">System Analytics</h2>
          <p className="text-base text-slate-500 font-medium mt-1">Performance and incident metrics</p>
        </div>

        <div className="flex bg-slate-200 p-1.5 rounded-xl">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${timeRange === range
                ? 'bg-white text-[#0EA5E9] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. KPI Grid (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Avg Response Time"
          value={`${data.averageResponseTime}m`}
          trend={-12}
          icon="mdi:timer-outline"
        />
        <KpiCard
          title="Total Resolution"
          value={data.resolvedIncidentCount}
          trend={8}
          icon="mdi:check-circle-outline"
        />
        <KpiCard
          title="Active Units"
          value={data.activeVolunteers}
          trend={5}
          icon="mdi:account-group-outline"
        />
        <KpiCard
          title="Efficiency Score"
          value="94%"
          trend={2}
          icon="mdi:lightning-bolt-outline"
        />
      </div>

      {/* 3. Main Analysis Section (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Incident Volume (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[450px] flex flex-col">
          <div className="mb-8 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Incident Volume Trends</h3>
            <button className="text-sm text-[#0EA5E9] font-bold hover:underline flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
              Export Report <Icon icon="mdi:export" />
            </button>
          </div>

          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B', fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Distribution & Severity (Spans 1 col) */}
        <div className="flex flex-col gap-8">

          {/* Severity Distribution */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex-1 min-h-[240px] flex flex-col justify-center">
            <h3 className="font-bold text-slate-800 mb-8 text-base flex items-center gap-2">
              Status Breakdown
              <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-bold">Live</span>
            </h3>

            <div className="space-y-6 px-1">
              {severityData.map((item, index) => {
                // Calculate percentage relative to max or total? Total gives distribution.
                const total = severityData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = Math.round((item.value / total) * 100);

                // Monochromatic Blue Shades
                // Critical (High) -> Darkest Blue
                // Low -> Lightest Blue
                const getBlueShade = (name: string) => {
                  switch (name) {
                    case 'Critical': return 'bg-[#1e3a8a] shadow-[#1e3a8a]/20'; // Blue 900
                    case 'High': return 'bg-[#2563eb] shadow-[#2563eb]/20';     // Blue 600
                    case 'Medium': return 'bg-[#60a5fa] shadow-[#60a5fa]/20';   // Blue 400
                    default: return 'bg-[#bfdbfe] shadow-[#bfdbfe]/20';         // Blue 200
                  }
                };

                return (
                  <div key={item.name} className="group cursor-default">
                    <div className="flex justify-between items-end mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${getBlueShade(item.name).split(' ')[0]}`} />
                        <span className="text-base font-semibold text-slate-700">{item.name}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-slate-900">{item.value}</span>
                        <span className="text-xs text-slate-400 font-bold">{percent}%</span>
                      </div>
                    </div>

                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-100 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: index * 0.1, type: "spring" }}
                        className={`h-full rounded-full shadow-lg ${getBlueShade(item.name)} absolute top-0 left-0 bottom-0`}
                      />
                      {/* Subtle shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full opacity-50" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown (Density Grid) */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex-1 min-h-[350px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-base">Incident Distribution Matrix</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">Frequency Map</span>
            </div>

            {/* Grid Container */}
            <div className="flex-1 w-full min-h-[250px] bg-slate-200/50 rounded-2xl border border-slate-100 p-5">
              <IncidentDensityGrid data={categoryData} />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              {categoryData.slice(0, 4).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i === 0 ? 'danger' : i === 1 ? 'warning' : 'primary'] || '#64748B' }} />
                  <span className="text-sm text-slate-600 font-semibold">{cat.name}: {cat.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </motion.div>
  );
}