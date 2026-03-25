'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AdminResources from '@/components/dashboard/resources/AdminResources';
import AgencyResources from '@/components/dashboard/resources/AgencyResources';
import { Icon } from '@iconify/react';

export default function ResourcesPage() {
    const { profile } = useSelector((state: RootState) => state.auth);
    const userRole = profile?.role;

    if (!userRole) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Icon icon="mdi:loading" className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    // Admin and Coordinator see the Admin View (Overview)
    if (userRole === 'admin' || userRole === 'coordinator') {
        return <AdminResources />;
    }

    // Agencies and Volunteers see their own Resource Management
    // (Assuming volunteers can also manage local resources, otherwise restrict)
    if (userRole === 'agency' || userRole === 'volunteer') {
        return <AgencyResources />;
    }

    return (
        <div className="text-center py-20">
            <h3 className="text-lg font-medium text-slate-600">Access Denied</h3>
            <p className="text-slate-400">You do not have permission to view this page.</p>
        </div>
    );
}
