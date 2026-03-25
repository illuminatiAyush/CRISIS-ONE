'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { signOut } from '@/store/slices/authSlice';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAgencyStatus } from '@/hooks/useAgencyStatus';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardSidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

interface NavigationItem {
  name: string;
  key: string;
  icon: string;
  href: string;
  badge?: number;
  roles: string[];
}

export default function DashboardSidebar({ mobileMenuOpen, setMobileMenuOpen }: DashboardSidebarProps) {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useSelector((state: RootState) => state.auth);

  // Local state for desktop collapse
  const [isRailExpanded, setIsRailExpanded] = useState(false);

  // Navigation Config - Role Based
  // Roles: 'citizen', 'volunteer', 'agency', 'admin', 'coordinator'
  const navigation: NavigationItem[] = [
    {
      name: t('nav.dashboard'),
      key: 'dashboard',
      icon: 'mdi:view-dashboard-outline',
      href: '/dashboard',
      roles: ['citizen', 'volunteer', 'agency', 'admin', 'coordinator']
    },
    {
      name: t('nav.incidents'),
      key: 'incidents',
      icon: 'mdi:alert-circle-outline',
      href: '/dashboard/incidents',
      roles: ['citizen', 'volunteer', 'agency', 'admin', 'coordinator']
    },
    {
      name: t('nav.map'),
      key: 'map',
      icon: 'mdi:map-outline',
      href: '/dashboard/map',
      roles: ['citizen', 'volunteer', 'agency', 'admin', 'coordinator']
    },
    {
      name: t('nav.analytics'),
      key: 'analytics',
      icon: 'mdi:chart-line',
      href: '/dashboard/analytics',
      roles: ['agency', 'admin', 'volunteer']
    },
    {
      name: t('nav.resources') || 'Resources',
      key: 'resources',
      icon: 'mdi:package-variant-closed',
      href: '/dashboard/resources',
      roles: ['volunteer', 'agency', 'admin', 'coordinator']
    },
    {
      name: t('nav.team') || 'Team Management',
      key: 'team',
      icon: 'mdi:account-group',
      href: '/dashboard/team',
      roles: ['agency', 'coordinator']
    },
    {
      name: t('nav.agency_mgmt') || 'Agency Management',
      key: 'agency_mgmt',
      icon: 'mdi:account-group',
      href: '/dashboard/agency-management',
      roles: ['admin']
    },
    {
      name: t('nav.sub_admins') || 'Sub-Admins',
      key: 'sub_admins',
      icon: 'mdi:shield-account',
      href: '/dashboard/sub-admins',
      roles: ['admin']
    },
    {
      name: t('nav.settings'),
      key: 'settings',
      icon: 'mdi:cog',
      href: '/dashboard/settings',
      roles: ['volunteer', 'agency', 'admin', 'coordinator']
    },
  ];

  // Custom Hook for Agency Status
  const { status, loading: agencyLoading } = useAgencyStatus();

  const currentRole = profile?.role || 'citizen';

  let filteredNavigation = navigation.filter(item => item.roles.includes(currentRole));

  // If agency, but not verified/approved, SHOW ONLY REGISTRATION LINK
  const isApproved = status?.toLowerCase() === 'approved' || status?.toLowerCase() === 'verified';

  if (currentRole === 'agency' && !isApproved) {
    filteredNavigation = [{
      name: t('nav.reg_status') || 'Registration Status',
      key: 'reg_status',
      icon: 'mdi:clipboard-text-clock',
      href: '/dashboard',
      roles: ['agency']
    }];
  }

  const handleLogout = () => {
    dispatch(signOut());
    router.push('/login');
  };

  return (
    <>
      {/* -------------------- DESKTOP SIDEBAR (RAIL) -------------------- */}
      <aside
        onMouseEnter={() => setIsRailExpanded(true)}
        onMouseLeave={() => setIsRailExpanded(false)}
        className={`fixed top-0 left-0 h-full z-40 bg-white border-r border-slate-200 shadow-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] hidden lg:flex flex-col
          ${isRailExpanded ? 'w-64' : 'w-24'}
        `}
      >
        {/* Rail Logo */}
        <div className="h-24 flex items-center justify-start px-5 shrink-0 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0 z-20 bg-blue-600 text-white shadow-lg">
            <Icon icon="mdi:shield-alert" className="w-7 h-7" />
          </div>

          <div className={`transition-all duration-300 absolute left-20 whitespace-nowrap ${isRailExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <span className="font-display font-bold text-2xl tracking-tight text-slate-800">Crisis</span>
            <span className="font-display font-bold text-2xl tracking-tight text-blue-600">One</span>
          </div>
        </div>

        {/* Rail Items */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-x-hidden">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-xl transition-all group relative overflow-hidden
                  ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-transparent text-slate-800 hover:text-blue-500 hover:bg-slate-50'}
                `}
              >
                <div className="w-10 flex justify-center shrink-0">
                  <Icon icon={item.icon} className={`w-6 h-6 group-hover:scale-110 transition-transform duration-300 ${isActive ? 'text-blue-600' : ''}`} />
                </div>

                <span
                  className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 absolute left-12 ${isRailExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                >
                  {item.name}
                </span>

                {/* Badge */}
                {item.badge && (
                  <span className={`absolute bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm transition-all duration-300 ${isRailExpanded ? 'right-3 top-3.5' : 'top-2 right-2 w-2.5 h-2.5 p-0 border-2 border-white'}`}>
                    {isRailExpanded ? item.badge : ''}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rail Footer */}
        <div className="p-4 flex justify-center mb-4">
          <button
            onClick={handleLogout}
            className={`flex items-center text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors overflow-hidden ${isRailExpanded ? 'w-full px-4 py-3' : 'p-3'}`}
            title={t("nav.logout")}
          >
            <Icon icon="mdi:logout" className="w-6 h-6 shrink-0" />
            <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${isRailExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              {t("nav.logout")}
            </span>
          </button>
        </div>
      </aside>

      {/* -------------------- MOBILE SIDEBAR (DRAWER) -------------------- */}
      {mobileMenuOpen && setMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl p-6 flex flex-col"
          >
            {/* Mobile Nav Content */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Icon icon="mdi:shield-alert" className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">CrisisOne</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}><Icon icon="mdi:close" className="w-6 h-6 text-gray-500" /></button>
            </div>

            <nav className="flex-1 space-y-2">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors
                    ${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-slate-50 hover:text-blue-600'}
                  `}
                >
                  <Icon icon={item.icon} className="w-6 h-6 mr-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="border-t border-slate-100 pt-4 mt-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                <Icon icon="mdi:logout" className="w-6 h-6 mr-4" />
                {t("nav.logout")}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </>
  );
}
