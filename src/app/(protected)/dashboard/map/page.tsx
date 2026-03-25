'use client';

import React from 'react';
import Map from '@/components/Map';
import { Incident, Resource } from '@/app/types';

// Mock Data for Demonstration
const MOCK_INCIDENTS: Incident[] = [
    {
        id: '1',
        category: 'Fire',
        severity: 'Critical',
        status: 'In Progress',
        location: { lat: 40.7589, lon: -73.9851 },
        description: 'Structure fire reported in Times Square area',
        reporterId: 'user-1',
        timestamp: new Date(),
        lastUpdated: new Date()
    },
    {
        id: '2',
        category: 'Medical',
        severity: 'High',
        status: 'Reported',
        location: { lat: 40.7549, lon: -73.9840 },
        description: 'Medical emergency, cardiac arrest',
        reporterId: 'user-2',
        timestamp: new Date(),
        lastUpdated: new Date()
    },
    {
        id: '3',
        category: 'Flood',
        severity: 'Medium',
        status: 'Assigned',
        location: { lat: 40.7600, lon: -73.9900 },
        description: 'Street flooding blocking traffic',
        reporterId: 'user-3',
        timestamp: new Date(),
        lastUpdated: new Date()
    },
    {
        id: '4',
        category: 'Other',
        severity: 'Low',
        status: 'Resolved',
        location: { lat: 40.7500, lon: -73.9800 },
        description: 'Minor traffic accident',
        reporterId: 'user-4',
        timestamp: new Date(),
        lastUpdated: new Date()
    },
    {
        id: '5',
        category: 'Fire',
        severity: 'Critical',
        status: 'In Progress',
        location: { lat: 40.7650, lon: -73.9750 },
        description: 'Smoke reported from subway ventilation',
        reporterId: 'user-5',
        timestamp: new Date(),
        lastUpdated: new Date()
    }
];

const MOCK_RESOURCES: Resource[] = [
    {
        id: 'r1',
        type: 'Medical',
        name: 'Ambulance Unit 5',
        status: 'Available',
        capacity: 1,
        currentLoad: 0,
        location: { lat: 40.7550, lon: -73.9850 },
        managerId: 'mgr-1',
        lastUpdated: new Date()
    },
    {
        id: 'r2',
        type: 'Volunteers',
        name: 'Community Response Team A',
        status: 'Allocated',
        capacity: 10,
        currentLoad: 8,
        location: { lat: 40.7600, lon: -73.9800 },
        managerId: 'mgr-2',
        lastUpdated: new Date()
    }
];

export default function MapPage() {
    return (
        <div className="w-full h-full p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800">Live Incident Map</h1>
                <p className="text-slate-500">Real-time visualization of reported incidents and available resources.</p>
            </div>

            <div className="w-full h-[calc(100vh-200px)] md:h-[600px] rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                <Map
                    incidents={MOCK_INCIDENTS}
                    resources={MOCK_RESOURCES}
                    center={[40.7589, -73.9851]}
                    zoom={13}
                    height="100%"
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}