'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy Data
const DUMMY_SUB_ADMINS = [
    { id: '1', name: 'Rohan Gupta', email: 'rohan@CrisisOne.in', role: 'Moderator', status: 'Active', joined: '10 Jan 2024' },
    { id: '2', name: 'Sarah Khan', email: 'sarah@CrisisOne.in', role: 'Viewer', status: 'Active', joined: '15 Jan 2024' },
    { id: '3', name: 'System Bot', email: 'bot@CrisisOne.in', role: 'Admin', status: 'Inactive', joined: '01 Jan 2024' },
];

export default function SubAdminManagementPage() {
    const [admins, setAdmins] = useState(DUMMY_SUB_ADMINS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Moderator' });

    const handleAdd = () => {
        if (!newAdmin.name || !newAdmin.email) return;
        setAdmins([...admins, {
            id: Math.random().toString(),
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role,
            status: 'Active',
            joined: 'Just now'
        }]);
        setIsModalOpen(false);
        setNewAdmin({ name: '', email: '', role: 'Moderator' });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sub-Admin Management</h1>
                    <p className="text-slate-500">Manage internal team access and permissions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
                >
                    <Icon icon="mdi:account-plus" className="w-5 h-5" />
                    Add New Member
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                    <div key={admin.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                                {admin.name.charAt(0)}
                            </div>
                            <div className="relative">
                                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                                    <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800">{admin.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">{admin.email}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${admin.role === 'Admin' ? 'bg-purple-50 text-purple-700' :
                                admin.role === 'Moderator' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {admin.role}
                            </span>
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${admin.status === 'Active' ? 'text-green-600' : 'text-slate-400'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${admin.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                {admin.status}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add Placeholder */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all min-h-[200px]"
                >
                    <Icon icon="mdi:plus-circle-outline" className="w-10 h-10 mb-2" />
                    <span className="font-medium">Add Team Member</span>
                </button>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Add New Sub-Admin</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newAdmin.name}
                                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={newAdmin.email}
                                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role Permission</label>
                                    <select
                                        value={newAdmin.role}
                                        onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option>Moderator</option>
                                        <option>Viewer</option>
                                        <option>Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button onClick={handleAdd} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Send Invitation</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
