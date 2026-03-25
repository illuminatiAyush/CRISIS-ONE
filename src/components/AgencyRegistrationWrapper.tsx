'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useAgencyStatus } from '@/hooks/useAgencyStatus';
import AgencyRegistrationForm from './AgencyRegistration/AgencyRegistrationForm';
import { Icon } from '@iconify/react';

export default function AgencyRegistrationWrapper({ children }: { children: React.ReactNode }) {
    // 1. Get user role from Redux
    const { profile } = useSelector((state: RootState) => state.auth);
    const userRole = profile?.role;

    // 2. Fetch agency status
    const { status, loading, agency } = useAgencyStatus();

    // If loading or normal user, show loading or children (for now handle loading gracefully)
    if (!userRole) return null; // Wait for auth

    // IF NOT AGENCY, JUST RENDER CHILDREN (Citizens/Admins don't register here)
    if (userRole !== 'agency') {
        return <>{children}</>;
    }

    // IF AGENCY, HANDLE STATUS
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Icon icon="mdi:loading" className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-slate-500 font-medium">Verifying Agency Status...</p>
                </div>
            </div>
        );
    }

    // CASE 1: UNREGISTERED or DRAFT -> SHOW FORM
    // Note: if status is 'draft', we might want to pre-fill the form. 
    // For now, let's assume 'draft' means they continue editing. The form fetched data? 
    // Actually, the current form doesn't fetch 'draft' data back, but let's just show form.
    // CASE 1: UNREGISTERED or DRAFT -> SHOW FORM
    if (status === 'unregistered' || status === 'draft') {
        return <AgencyRegistrationForm initialData={agency} onSuccess={() => {
            // Force a hard reload or robust refetch
            window.location.reload();
        }} />;
    }

    // CASE 2: SUBMITTED / UNDER REVIEW -> SHOW PENDING SCREEN
    if (status === 'submitted' || status === 'under_review') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon icon="mdi:timer-sand" className="w-10 h-10 text-yellow-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Under Review</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Thank you for registering <strong>{agency?.agency_name}</strong>.
                        Our admins are currently verifying your documents. You will receive an email once approved.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl text-left flex items-center gap-3 border border-slate-200">
                        <Icon icon="mdi:information-outline" className="text-slate-400 w-5 h-5" />
                        <div className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700 block mb-0.5">Estimated Time</span>
                            24-48 Business Hours
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // CASE 3: REJECTED -> SHOW REJECTION SCREEN
    if (status === 'rejected') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon icon="mdi:close-circle-outline" className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Rejected</h2>
                    <p className="text-slate-500 mb-6 leading-relaxed">
                        Unfortunately, your agency application was not approved.
                        <br />
                        Please check your email for the rejection reason.
                    </p>
                    <div className="space-y-3">
                        <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                            Refresh Status
                        </button>
                        <button className="text-blue-600 font-bold hover:underline text-sm">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // CASE 4: APPROVED / VERIFIED -> SHOW DASHBOARD
    if (status?.toLowerCase() === 'approved' || status?.toLowerCase() === 'verified') {
        return <>{children}</>;
    }

    return null;
}
