'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy Data
const DUMMY_RESOURCES = [
    { id: '1', name: 'Oxygen Cylinders', category: 'Medical', quantity: 50, unit: 'units', status: 'Available', lastUpdated: '2 hours ago' },
    { id: '2', name: 'Food Packets', category: 'Food', quantity: 15, unit: 'packets', status: 'Low Stock', lastUpdated: '5 hours ago' },
    { id: '3', name: 'Rescue Boats', category: 'Transport', quantity: 3, unit: 'boats', status: 'In Use', lastUpdated: '1 day ago' },
    { id: '4', name: 'Blankets', category: 'Shelter', quantity: 200, unit: 'pcs', status: 'Available', lastUpdated: '3 days ago' },
];

export default function AgencyResources() {
    const [resources, setResources] = useState(DUMMY_RESOURCES);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Stats
    const totalItems = resources.length;
    const lowStock = resources.filter(r => r.status === 'Low Stock').length;
    const categories = new Set(resources.map(r => r.category)).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Resources</h1>
                    <p className="text-slate-500">Manage your agency's inventory and assets</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium flex items-center justify-center gap-2 transition-all">
                        <Icon icon="mdi:file-upload-outline" className="w-5 h-5" />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-200"
                    >
                        <Icon icon="mdi:plus" className="w-5 h-5" />
                        Add Resource
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Items</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalItems}</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Icon icon="mdi:package-variant" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{lowStock}</h3>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <Icon icon="mdi:alert-circle-outline" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Categories</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{categories}</h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <Icon icon="mdi:shape-outline" className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Resource Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                <th className="px-6 py-4">Resource Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Updated</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {resources.map((resource) => (
                                <tr key={resource.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800">{resource.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                            {resource.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 font-medium">{resource.quantity} {resource.unit}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${resource.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' :
                                                resource.status === 'Low Stock' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                            {resource.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{resource.lastUpdated}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                            <Icon icon="mdi:pencil-outline" className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors ml-1">
                                            <Icon icon="mdi:trash-can-outline" className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Resource Modal (Mock) */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Add New Resource</h3>
                                <button onClick={() => setIsAddModalOpen(false)}><Icon icon="mdi:close" className="w-6 h-6 text-slate-500" /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Resource Name</label>
                                    <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Generators" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                        <select className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                            <option>Medical</option>
                                            <option>Food</option>
                                            <option>Transport</option>
                                            <option>Shelter</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                        <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Add Resource</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
