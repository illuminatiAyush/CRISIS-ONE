import { useState, useEffect } from 'react';
import axios from 'axios';

interface AgencyStatus {
    status: 'unregistered' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    agency: any | null;
}

export function useAgencyStatus() {
    const [data, setData] = useState<AgencyStatus>({ status: 'unregistered', agency: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        try {
            // Only set loading on first fetch to avoid UI flicker
            if (!data.status || data.status === 'unregistered') {
                // setLoading(true); // Don't block UI on poll
            }

            const res = await axios.get('/api/agency/registration');
            // Optimised: only update if changed to avoid re-renders? 
            // For now, simpler to just set data.
            setData({
                status: res.data.status,
                agency: res.data.agency,
            });
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch agency status:", err);
            setError(err.message || "Failed to fetch status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return { ...data, loading, error, refetch: fetchStatus };
}
