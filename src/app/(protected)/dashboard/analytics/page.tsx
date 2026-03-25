'use client';

import React from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AuthLayout from '@/components/layouts/AuthLayout';

export default function AnalyticsPage() {
    return (
        <AuthLayout allowedRoles={['citizen', 'volunteer', 'agency', 'admin', 'coordinator']}>
        <AnalyticsDashboard />
        </AuthLayout>
    );
}
