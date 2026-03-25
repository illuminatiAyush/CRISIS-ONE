'use client';

/**
 * Dashboard Layout - Material Design
 * Features: Collapsible Rail Navigation, Top Header for User Context, Independent Scroll Zones
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { signOut } from '@/store/slices/authSlice';
import { UserRole } from '@/app/types';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title = "Dashboard", subtitle }: DashboardLayoutProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useSelector((state: RootState) => state.auth);

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Time effect
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    dispatch(signOut());
    router.push('/login');
  };

  const currentRole = profile?.role || 'citizen';

  // Basic title logic if generic
  // Ideally, titles should be handled by the pages or a context, but here we fallback
  const getPageTitle = () => {
    if (title !== "Dashboard") return title;
    // Map path to title manually if needed, or just let page set it
    if (pathname?.includes('/incidents')) return 'Incidents';
    if (pathname?.includes('/map')) return 'Operations Map';
    if (pathname?.includes('/analytics')) return 'System Analytics';
    return "Dashboard";
  };

  const displayTitle = getPageTitle();

  return (
    <div className="min-h-screen bg-slate-200 flex font-sans text-gray-900 overflow-hidden">

      {/* -------------------- NAVIGATION SIDEBAR -------------------- */}
      <DashboardSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* -------------------- MAIN AREA -------------------- */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-24`}>

        {/* TOP HEADER */}
        <header className="h-24 sticky top-0 z-30 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/50">

          {/* Left: Mobile Menu & Title */}
          <div className="flex items-center">
            <button
              className="lg:hidden mr-4 p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Icon icon="mdi:menu" className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold text-[#1B2559] leading-tight">{displayTitle}</h1>
              {subtitle && <p className="text-sm font-medium text-slate-500 hidden sm:block mt-1">{subtitle}</p>}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">

            {/* Clock */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>{currentTime ? currentTime.toLocaleTimeString([], { hour12: false }) : '--:--:--'}</span>
            </div>

            {/* Role Badge */}
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wide">
              {currentRole}
            </span>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-blue-700 font-bold text-sm">
                  {profile?.email ? profile.email.substring(0, 2).toUpperCase() : 'US'}
                </div>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900">{profile?.email || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{currentRole}</p>
                    </div>

                    <div className="border-t border-gray-50 pt-2">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center">
                        <Icon icon="mdi:logout" className="w-4 h-4 mr-2" />
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden w-full max-w-[1920px] mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
