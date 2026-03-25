"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const navItems = [
  { href: "/mvp", label: "Dashboard", icon: "mdi:view-dashboard-outline" },
  { href: "/mvp/report", label: "Report", icon: "mdi:alert-plus-outline" },
  { href: "/mvp/map", label: "Map", icon: "mdi:map-marker-radius-outline" },
  { href: "/mvp/alerts", label: "Alerts", icon: "mdi:bell-ring-outline" },
  { href: "/mvp/resources", label: "Resources", icon: "mdi:package-variant-closed" },
];

export default function MVPLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/mvp" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-shadow">
                <Icon icon="mdi:shield-alert" className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
                  Crisis<span className="text-sky-500">One</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 tracking-widest uppercase leading-none">
                  Disaster Response Platform
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-sky-50 text-sky-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                  >
                    <Icon icon={item.icon} className="w-[18px] h-[18px]" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Status Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
