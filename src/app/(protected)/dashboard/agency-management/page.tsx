'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Agency {
    id: string;
    agency_name: string;
    agency_type: string;
    status: string;
    agency_address: string;
    city: string;
    state: string;
    created_at?: string;
    // Full details
    team_size?: number;
    pin_code?: string;
    owner_phone?: string;
    owner_aadhaar_masked?: string;
    services_offered?: string[];
    pan?: string;
    gst?: string;
    ngo_darpan_id?: string;
    registration_certificate_url?: string;
    clinic_license_url?: string;
    business_reg_url?: string;
    email?: string;
    contact_email?: string;
    agency_email?: string;
}

export default function AgencyManagementPage() {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
    const [selectedDocImage, setSelectedDocImage] = useState<string | null>(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    // Query Modal State
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
    const [queryMessage, setQueryMessage] = useState('');
    const [targetEmail, setTargetEmail] = useState('');
    const [sendingQuery, setSendingQuery] = useState(false);
    const [queryError, setQueryError] = useState<string | null>(null);

    const [fullDetailsLoading, setFullDetailsLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const res = await axios.get('/api/admin/get-agencies');
            if (res.data.data) {
                setAgencies(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch agencies", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgencyDetails = async (id: string, isOpen = true) => {
        if (isOpen) setFullDetailsLoading(true);
        try {
            const res = await axios.get(`/api/admin/get-agencies?id=${id}`);
            if (res.data.data) {
                const agencyData = res.data.data;
                if (isOpen) {
                    setSelectedAgency(agencyData);
                    setTargetEmail(agencyData.agency_email || agencyData.email || agencyData.contact_email || '');
                } else {
                    // Just update list item if needed
                    setAgencies(prev => prev.map(a => a.id === id ? { ...a, ...agencyData } : a));
                }
            }
        } catch (error) {
            console.error("Failed to fetch agency details", error);
        } finally {
            if (isOpen) setFullDetailsLoading(false);
        }
    };

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleUpdateStatus = async (status: string, reason?: string) => {
        if (!selectedAgency) return;
        setVerifying(true);
        try {
            await axios.post('/api/admin/update-agency-status', {
                agencyId: selectedAgency.id,
                status,
                rejectionReason: reason // Pass reason to API
            });

            alert(`Agency ${status} successfully.`);

            // Update local state
            const updatedAgency = { ...selectedAgency, status };
            setSelectedAgency(updatedAgency);
            setAgencies(prev => prev.map(a => a.id === selectedAgency.id ? updatedAgency : a));

            if (status === 'verified') {
                setIsQueryModalOpen(false); // Close if open
            }
            if (status === 'rejected') {
                setIsRejectModalOpen(false);
                setRejectionReason('');
            }
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to update status");
        } finally {
            setVerifying(false);
        }
    };

    const handleRejectClick = () => {
        setIsRejectModalOpen(true);
    };

    const confirmRejection = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        handleUpdateStatus('rejected', rejectionReason);
    };

    const handleViewDetails = (agency: Agency) => {
        setSelectedAgency(agency);
        setTargetEmail(agency.agency_email || agency.email || agency.contact_email || '');
        fetchAgencyDetails(agency.id);
    };

    const handleSendQuery = async () => {
        if (!selectedAgency || !queryMessage.trim() || !targetEmail.trim()) {
            if (!targetEmail.trim()) setQueryError("Email address is required.");
            return;
        }

        setSendingQuery(true);
        setQueryError(null);

        try {
            const payload = {
                agencyEmail: targetEmail,
                message: queryMessage,
                agencyName: selectedAgency.agency_name
            };

            await axios.post('/api/admin/send-query', payload);
            setIsQueryModalOpen(false);
            setQueryMessage('');
            setTargetEmail('');
            alert('Query sent successfully via email.');
        } catch (err: any) {
            console.error(err);
            setQueryError(err.message || "Failed to send query.");
        } finally {
            setSendingQuery(false);
        }
    };

    // Filter Logic
    const filteredAgencies = useMemo(() => {
        return agencies.filter(agency => {
            // 1. Hide Drafts (Prompt requirement)
            if (agency.status?.toLowerCase() === 'draft') return false;

            // 2. Search Query
            const matchesSearch =
                agency.agency_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                agency.agency_type.toLowerCase().includes(searchQuery.toLowerCase());

            // 3. Status Filter
            const matchesStatus = statusFilter === 'All' || (agency.status || '').toLowerCase() === statusFilter.toLowerCase();

            // 4. Type Filter
            const matchesType = typeFilter === 'All' || agency.agency_type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [agencies, searchQuery, statusFilter, typeFilter]);

    const uniqueTypes = useMemo(() => Array.from(new Set(agencies.map(a => a.agency_type))), [agencies]);

    const InfoRow = ({ label, value }: { label: string, value: any }) => (
        <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className="text-sm text-slate-800 font-semibold text-right max-w-[60%] truncate">{value || '-'}</span>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header & Stats/Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Agency Management</h1>
                    <p className="text-slate-500">Verify and manage registered agencies</p>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search agencies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Types</option>
                        {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Main List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Icon icon="mdi:loading" className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : filteredAgencies.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <Icon icon="mdi:domain-off" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700">No agencies found</h3>
                    <p className="text-slate-500">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-6">Agency Name</div>
                        <div className="col-span-3">Type</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {filteredAgencies.map((agency) => (
                        <div key={agency.id} onClick={() => handleViewDetails(agency)} className="group bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:shadow-md transition-all cursor-pointer">
                            <div className="col-span-6 font-semibold text-slate-800">
                                {agency.agency_name}
                            </div>

                            <div className="col-span-3 text-sm text-slate-600">
                                {agency.agency_type}
                            </div>

                            <div className="col-span-2 flex justify-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${(agency.status || '').toLowerCase() === 'verified' || (agency.status || '').toLowerCase() === 'approved'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : (agency.status || '').toLowerCase() === 'rejected'
                                        ? 'bg-red-100 text-red-700 border-red-200'
                                        : (agency.status || '').toLowerCase() === 'submitted'
                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    }`}>
                                    {agency.status || 'Pending'}
                                </span>
                            </div>

                            <div className="col-span-1 flex justify-end">
                                <Icon icon="mdi:chevron-right" className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Slide-over */}
            <AnimatePresence>
                {selectedAgency && (
                    <div className="fixed inset-0 z-50 flex justify-end isolate">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAgency(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{selectedAgency.agency_name}</h2>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        Status:
                                        <span className={`font-semibold capitalize ${(selectedAgency.status || '').toLowerCase() === 'verified' ? 'text-green-600' :
                                            (selectedAgency.status || '').toLowerCase() === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                            }`}>
                                            {selectedAgency.status || 'Pending'}
                                        </span>
                                    </p>
                                </div>
                                <button onClick={() => setSelectedAgency(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                                    <Icon icon="mdi:close" className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                                {fullDetailsLoading ? (
                                    <div className="flex justify-center py-10">
                                        <Icon icon="mdi:loading" className="w-8 h-8 text-blue-600 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Verification Actions */}
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3">
                                            {(selectedAgency.status || '').toLowerCase() === 'verified' ? (
                                                <div className="w-full py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center justify-center gap-2 font-medium">
                                                    <Icon icon="mdi:check-decagram" className="w-5 h-5" />
                                                    Agency Verified
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus('verified')}
                                                        disabled={verifying}
                                                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Icon icon="mdi:check-decagram" className="w-5 h-5" />
                                                        {verifying ? 'Verifying...' : 'Verify Agency'}
                                                    </button>

                                                    {/* Reject Option */}
                                                    {(selectedAgency.status || '').toLowerCase() !== 'rejected' && (
                                                        <button
                                                            onClick={handleRejectClick}
                                                            disabled={verifying}
                                                            className="px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
                                                            title="Reject Agency"
                                                        >
                                                            <Icon icon="mdi:close-circle-outline" className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            <button
                                                onClick={() => setIsQueryModalOpen(true)}
                                                className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                                            >
                                                <Icon icon="mdi:message-question-outline" className="w-5 h-5" />
                                                Query
                                            </button>
                                        </div>


                                        {/* Info Sections */}
                                        <div className="space-y-6">
                                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                        <Icon icon="mdi:domain" /> Basic Information
                                                    </h3>
                                                </div>
                                                <div className="p-5 pt-2">
                                                    <InfoRow label="Type" value={selectedAgency.agency_type} />
                                                    <InfoRow label="Team Size" value={selectedAgency.team_size} />
                                                    <InfoRow label="Address" value={selectedAgency.agency_address} />
                                                    <InfoRow label="City/State" value={`${selectedAgency.city}, ${selectedAgency.state}`} />
                                                    <InfoRow label="Pincode" value={selectedAgency.pin_code} />
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                        <Icon icon="mdi:hand-heart" /> Services
                                                    </h3>
                                                </div>
                                                <div className="p-5">
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedAgency.services_offered && selectedAgency.services_offered.length > 0 ? (
                                                            selectedAgency.services_offered.map((s: string) => (
                                                                <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                                                    {s}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-400 text-sm">No services listed</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                        <Icon icon="mdi:shield-check" /> Verification Details
                                                    </h3>
                                                </div>
                                                <div className="p-5 pt-2">
                                                    <InfoRow label="Email" value={selectedAgency.agency_email || selectedAgency.email} />
                                                    <InfoRow label="Owner Phone" value={selectedAgency.owner_phone} />
                                                    <InfoRow label="Aadhaar (Last 4)" value={selectedAgency.owner_aadhaar_masked ? `XXXX-${selectedAgency.owner_aadhaar_masked}` : '-'} />
                                                    {selectedAgency.pan && <InfoRow label="PAN" value={selectedAgency.pan} />}
                                                    {selectedAgency.gst && <InfoRow label="GST" value={selectedAgency.gst} />}
                                                    {selectedAgency.ngo_darpan_id && <InfoRow label="NGO Darpan ID" value={selectedAgency.ngo_darpan_id} />}
                                                </div>

                                                {/* Documents */}
                                                <div className="p-5 pt-0 grid gap-2">
                                                    <div className="text-sm font-semibold text-slate-500 mb-2">Attached Documents</div>
                                                    {['registration_certificate_url', 'clinic_license_url', 'business_reg_url'].map(docKey => {
                                                        const docUrl = (selectedAgency as any)[docKey];
                                                        if (!docUrl || typeof docUrl !== 'string') return null;
                                                        const isImage = docUrl.match(/\.(jpeg|jpg|png|webp)$/i);

                                                        return (
                                                            <div key={docKey} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-blue-300 transition-colors">
                                                                <span className="text-sm font-medium text-slate-700 capitalize">
                                                                    {docKey.replace(/_url/g, '').replace(/_/g, ' ')}
                                                                </span>

                                                                <button
                                                                    onClick={() => {
                                                                        if (isImage) {
                                                                            setSelectedDocImage(docUrl);
                                                                        } else {
                                                                            window.open(docUrl, '_blank');
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 shadow-sm"
                                                                    title="View Document"
                                                                >
                                                                    <Icon icon={isImage ? "mdi:eye" : "mdi:open-in-new"} className="w-4 h-4" />
                                                                    {isImage ? "View Preview" : "Open PDF"}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                    {/* Fallback if no documents found */}
                                                    {!selectedAgency.registration_certificate_url && !selectedAgency.clinic_license_url && !selectedAgency.business_reg_url && (
                                                        <div className="p-4 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                            No documents uploaded
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )
                                }
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Query Modal */}
            <AnimatePresence>
                {isQueryModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsQueryModalOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Send Query</h3>
                                <button onClick={() => setIsQueryModalOpen(false)}><Icon icon="mdi:close" className="text-slate-500" /></button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-600 mb-4">
                                    Send a query to <span className="font-semibold text-slate-800">{selectedAgency?.agency_name}</span>.
                                </p>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Recipient Email
                                    </label>
                                    <input
                                        type="email"
                                        value={targetEmail}
                                        onChange={(e) => setTargetEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Enter agency email"
                                    />
                                </div>

                                <textarea
                                    value={queryMessage}
                                    onChange={(e) => setQueryMessage(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
                                    placeholder="Type your query here..."
                                />

                                {queryError && (
                                    <p className="text-red-500 text-sm mb-4">{queryError}</p>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsQueryModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendQuery}
                                        disabled={sendingQuery || !queryMessage.trim() || !targetEmail.trim()}
                                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 ${sendingQuery ? 'opacity-70' : 'hover:bg-blue-700'}`}
                                    >
                                        {sendingQuery ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:send" />}
                                        Send Email
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Rejection Modal */}
            <AnimatePresence>
                {isRejectModalOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRejectModalOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
                                <h3 className="font-bold text-red-800 flex items-center gap-2">
                                    <Icon icon="mdi:alert-circle" /> Reject Application
                                </h3>
                                <button onClick={() => setIsRejectModalOpen(false)}><Icon icon="mdi:close" className="text-slate-500" /></button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-600 mb-4">
                                    You are about to reject <span className="font-semibold text-slate-800">{selectedAgency?.agency_name}</span>.
                                    Please provide a reason. This will be emailed to the agency.
                                </p>

                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none mb-4"
                                    placeholder="Reason for rejection (e.g. Invalid documents)..."
                                />

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsRejectModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmRejection}
                                        disabled={verifying || !rejectionReason.trim()}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 disabled:opacity-70"
                                    >
                                        {verifying ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:gavel" />}
                                        Confirm Rejection
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Document Image Modal */}
            <AnimatePresence>
                {selectedDocImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedDocImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedDocImage(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-10"
                            >
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                            <img src={selectedDocImage} alt="Document" className="w-full h-full object-contain max-h-[85vh]" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
