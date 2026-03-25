"use client";

import React, { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { computePriorityScore } from "@/lib/crisisEngine";

const categories = [
  { value: "Flood", icon: "mdi:waves" },
  { value: "Fire", icon: "mdi:fire" },
  { value: "Earthquake", icon: "mdi:home-alert" },
  { value: "Medical", icon: "mdi:hospital-box" },
  { value: "Road Accident", icon: "mdi:car-crash" },
  { value: "Building Collapse", icon: "mdi:office-building-cog" },
  { value: "Gas Leak", icon: "mdi:gas-cylinder" },
  { value: "Other", icon: "mdi:help-circle" },
];

const severities = [
  { value: "Low", color: "bg-green-50 border-green-200 text-green-700" },
  { value: "Medium", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { value: "High", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { value: "Critical", color: "bg-red-50 border-red-200 text-red-700" },
];

export default function ReportIncidentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Flood",
    severity: "Medium",
    description: "",
    lat: "",
    lng: "",
    alert_radius: "5",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const supabase = getSupabaseClient();
    const score = computePriorityScore(form.severity, new Date().toISOString());

    const { error } = await supabase.from("incidents").insert([
      {
        title: form.title,
        category: form.category,
        severity: form.severity,
        description: form.description || null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        alert_radius: parseInt(form.alert_radius) || 5,
        priority_score: score,
        status: "pending",
      },
    ]);

    setSubmitting(false);

    if (error) {
      alert("Failed to submit: " + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/mvp"), 1500);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5 shadow-lg shadow-emerald-100">
          <Icon icon="mdi:check-circle" className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Incident Reported!</h2>
        <p className="text-slate-500 text-sm mt-2">Auto-assigning nearest agency...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Report Incident</h1>
        <p className="text-slate-500 text-sm mt-1">
          Submit an emergency report. Our system will auto-assign the nearest response team.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Incident Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Major flood near Station Road"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
          />
        </div>

        {/* Category - Visual Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Category <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm({ ...form, category: c.value })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                  form.category === c.value
                    ? "bg-sky-50 border-sky-300 text-sky-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon icon={c.icon} className="w-5 h-5" />
                {c.value}
              </button>
            ))}
          </div>
        </div>

        {/* Severity - Visual Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Severity <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {severities.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm({ ...form, severity: s.value })}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  form.severity === s.value
                    ? s.color + " shadow-sm ring-1 ring-current/20"
                    : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                }`}
              >
                {s.value}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the situation..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all resize-none"
          />
        </div>

        {/* Location + Alert Radius */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              name="lat"
              step="any"
              value={form.lat}
              onChange={handleChange}
              placeholder="19.076"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              name="lng"
              step="any"
              value={form.lng}
              onChange={handleChange}
              placeholder="72.877"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Alert Radius (km)
            </label>
            <input
              type="number"
              name="alert_radius"
              min="1"
              max="50"
              value={form.alert_radius}
              onChange={handleChange}
              placeholder="5"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !form.title}
          className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Icon icon="mdi:send" className="w-5 h-5" />
              Submit & Auto-Assign
            </>
          )}
        </button>
      </form>
    </div>
  );
}
