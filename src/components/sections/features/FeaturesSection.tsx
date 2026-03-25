"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Secure & Verified",
    description:
      "Every report is verified through community consensus and official checks to ensure data integrity and prevent misuse.",
  },
  {
    icon: Zap,
    title: "Real-time Alerts",
    description:
      "Instant notifications sent to relevant authorities and nearby citizens the moment a high-priority issue is detected.",
  },
  {
    icon: BarChart3,
    title: "Actionable Insights",
    description:
      "Advanced AI models predict cluster hotspots and resource needs, equipping decision-makers with proactive strategies.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Built for modern smart cities
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            A comprehensive suite of tools designed to bridge the gap between citizens and authorities, backed by intelligent automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
