import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

interface DashboardStats {
    totalActiveIncidents: number;
    totalCriticalIncidents: number;
    totalAgencies: number;
    totalVolunteers: number;
}

interface UseDashboardStatsReturn {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
}

export function useDashboardStats(): UseDashboardStatsReturn {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            // Don't set loading to true on refetch to avoid flickering
            if (!stats) setLoading(true);

            const response = await fetch('/api/admin/get-summary');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        const supabase = getSupabaseBrowserClient();

        // Subscribe to changes in incidents, agencies, and volunteers
        const channels = [
            supabase
                .channel('dashboard-incidents')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'incidents' },
                    () => {
                        console.log('Realtime update: incidents');
                        fetchStats();
                    }
                )
                .subscribe(),

            supabase
                .channel('dashboard-agencies')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'agencies' },
                    () => {
                        console.log('Realtime update: agencies');
                        fetchStats();
                    }
                )
                .subscribe(),

            supabase
                .channel('dashboard-volunteers')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'volunteers' },
                    () => {
                        console.log('Realtime update: volunteers');
                        fetchStats();
                    }
                )
                .subscribe(),
        ];

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel));
        };
    }, []);

    return { stats, loading, error };
}
