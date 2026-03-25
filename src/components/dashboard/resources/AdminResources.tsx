'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

// Dummy Data for Admin View
const DUMMY_ALL_RESOURCES = [
    { id: '1', agency: 'Mumbai Relief Squad', name: 'Oxygen Cylinders', category: 'Medical', quantity: 50, status: 'Available' },
    { id: '2', agency: 'Pune Rescue Team', name: 'Life Jackets', category: 'Safety', quantity: 120, status: 'Available' },
    { id: '3', agency: 'Nagpur Utils', name: 'Generators', category: 'Power', quantity: 5, status: 'In Use' },
    { id: '4', agency: 'Mumbai Relief Squad', name: 'First Aid Kits', category: 'Medical', quantity: 10, status: 'Low Stock' },
    { id: '5', agency: 'Delhi Response', name: 'Food Packs', category: 'Food', quantity: 500, status: 'Available' },
    { id: '6', agency: 'Pune Rescue Team', name: 'Ambulances', category: 'Transport', quantity: 2, status: 'In Use' },
];

export default function AdminResources() {
    const [filterAgency, setFilterAgency] = useState('All');

    const filteredResources = filterAgency === 'All'
        ? DUMMY_ALL_RESOURCES
        : DUMMY_ALL_RESOURCES.filter(r => r.agency === filterAgency);

    // Aggregated Stats
    const totalResources = DUMMY_ALL_RESOURCES.reduce((acc, curr) => acc + curr.quantity, 0);
    const activeAgencies = new Set(DUMMY_ALL_RESOURCES.map(r => r.agency)).size;
    const criticalItems = DUMMY_ALL_RESOURCES.filter(r => r.status === 'Low Stock' || r.status === 'In Use').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Resource Overview</h1>
                    <p className="text-slate-500">Monitor resources across all registered agencies</p>
                </div>
                <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                    <Icon icon="mdi:download" className="w-5 h-5" />
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Icon icon="mdi:database" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-blue-100 font-medium text-sm">Total Inventory Count</p>
                            <h3 className="text-3xl font-bold">{totalResources.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:domain" className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium text-sm">Contributing Agencies</p>
                        <h3 className="text-2xl font-bold text-slate-800">{activeAgencies}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:alert-circle-outline" className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium text-sm">Critical / In Use</p>
                        <h3 className="text-2xl font-bold text-slate-800">{criticalItems}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border boundary-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Icon icon="mdi:view-list" className="text-slate-400" />
                        Master Inventory
                    </h3>
                    <select
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={filterAgency}
                        onChange={(e) => setFilterAgency(e.target.value)}
                    >
                        <option value="All">All Agencies</option>
                        {[...new Set(DUMMY_ALL_RESOURCES.map(r => r.agency))].map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                <th className="px-6 py-4">Resource</th>
                                <th className="px-6 py-4">Agency</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredResources.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-700">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{item.agency}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-700">{item.quantity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                item.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
