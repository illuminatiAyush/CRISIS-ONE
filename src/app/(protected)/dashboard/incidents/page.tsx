'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import IncidentReportForm from '@/components/IncidentReportForm';
import { useIncidents } from '@/app/hooks/useIncidents';
import { useSelector } from 'react-redux';

export default function IncidentsPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Get current user from Redux
  const user = useSelector((state: any) => state.auth.user); // Using any temporarily if RootState issues arise, but prefer typed

  const {
    filteredIncidents,
    loading,
    filters,
    setFilters,
    clearFilters
  } = useIncidents();

  // Set reporterId in filters when user is available and "My Incidents" is toggled
  useEffect(() => {
    if (user?.id) {
      setFilters({ reporterId: user.id });
    }
  }, [user, setFilters]);

  const toggleMyIncidents = () => {
    setFilters({ onlyMyIncidents: !filters.onlyMyIncidents });
  };

  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'Critical': return 'bg-red-50 text-red-600 border-red-100';
      case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Reported': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'In Progress': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Resolved': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2559]">Incident Management</h1>
          <p className="text-slate-500 font-medium mt-1">Track and coordinate emergency responses in real-time</p>
        </div>
        <div className="flex items-center gap-3 relative">

          {/* Filter Button & Menu */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-medium transition-colors ${filters.onlyMyIncidents
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Icon icon="mdi:filter-variant" className="w-5 h-5" />
              Filters
              {filters.onlyMyIncidents && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">1</span>}
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 origin-top-right"
                >
                  <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">Filter Options</h3>

                  {/* My Incidents Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={toggleMyIncidents}>
                    <span className="text-sm font-semibold text-slate-700">My Incidents Only</span>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${filters.onlyMyIncidents ? 'bg-[#0EA5E9]' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${filters.onlyMyIncidents ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Add more filters here if needed (Category, Severity, etc.) */}

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={clearFilters}
                      className="flex-1 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="flex-1 px-3 py-2 text-xs font-bold bg-[#0EA5E9] text-white rounded-lg hover:bg-blue-600"
                    >
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white rounded-xl font-medium hover:bg-[#0284C7] shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all active:scale-95"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" />
            Report New
          </button>
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Icon icon="mdi:loading" className="w-8 h-8 animate-spin mb-2 text-[#0EA5E9]" />
            <p>Loading incidents...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Icon icon="mdi:clipboard-text-off-outline" className="w-12 h-12 mb-2 opacity-50" />
            <p>No incidents found matching your filters.</p>
            {filters.onlyMyIncidents && <p className="text-sm mt-1 text-slate-400">Try turning off "My Incidents" filter.</p>}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-12 md:col-span-5 pl-2">Incident Details</div>
              <div className="hidden md:block md:col-span-3">Reporter</div>
              <div className="col-span-6 md:col-span-2 text-center">Severity</div>
              <div className="col-span-6 md:col-span-2 text-right pr-4">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100">
              {filteredIncidents.map((incident) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-slate-50/80 transition-all duration-200 group border-l-4 border-transparent hover:border-[#0EA5E9] cursor-pointer"
                >
                  {/* Details */}
                  <div className="col-span-12 md:col-span-5">
                    <div className="flex items-start gap-4">
                      {/* Image Preview or Icon */}
                      {/* Image Preview or Icon */}
                      <div className="relative shrink-0 flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 ${incident.category === 'Fire' ? 'bg-red-50 text-red-500' :
                          incident.category === 'Medical' ? 'bg-blue-50 text-blue-500' :
                            incident.category === 'Flood' ? 'bg-cyan-50 text-cyan-500' :
                              'bg-slate-50 text-slate-500'
                          }`}>
                          <Icon icon={
                            incident.category === 'Fire' ? 'mdi:fire' :
                              incident.category === 'Medical' ? 'mdi:medical-bag' :
                                incident.category === 'Flood' ? 'mdi:home-flood' :
                                  'mdi:alert-circle'
                          } className="w-6 h-6" />
                        </div>

                        {incident.img_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(incident.img_url || null);
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 shadow-sm text-[10px] font-bold text-blue-600 rounded-md hover:bg-blue-50 flex items-center gap-1 transition-all z-20"
                          >
                            <Icon icon="mdi:eye" className="w-3 h-3" />
                            View Doc
                          </button>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-800 text-base mb-1">{incident.category}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2 font-medium leading-relaxed">{incident.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Icon icon="mdi:calendar-blank" className="w-3.5 h-3.5" />
                            {new Date(incident.timestamp).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5" />
                            {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reporter */}
                  <div className="hidden md:flex md:col-span-3 items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200 p-0.5 shadow-sm">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${incident.reporterId || 'anon'}`}
                        alt="Avatar"
                        className="w-full h-full rounded-full bg-slate-100"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700"> User {incident.reporterId?.slice(0, 4)}...</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        Reporter
                      </p>
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="col-span-6 md:col-span-2 flex justify-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm flex items-center gap-1.5 ${getSeverityColor(incident.severity || 'Low')}`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                      {incident.severity}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(incident.status || 'Reported')}`}>
                      {incident.status}
                    </span>

                    <button className="p-2 text-slate-300 hover:text-[#0EA5E9] hover:bg-blue-50 rounded-xl transition-all">
                      <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination (Static for now) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <p>Showing {filteredIncidents.length} results</p>
            </div>
          </>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl relative"
            >
              <button
                onClick={() => setShowReportModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
              >
                <Icon icon="mdi:close" className="w-5 h-5 text-slate-600" />
              </button>
              <IncidentReportForm
                onCancel={() => setShowReportModal(false)}
                onSubmit={() => {
                  setShowReportModal(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-10"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
              <img src={selectedImage} alt="Evidence" className="w-full h-full object-contain max-h-[85vh]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}