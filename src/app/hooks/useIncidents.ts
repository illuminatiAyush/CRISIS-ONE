import { useState, useEffect, useCallback } from 'react';
import { Incident, IncidentFilters } from '@/app/types';
import { incidentService } from '@/app/services/incidentService'; // Updated import
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'; // For realtime
import { IncidentCategory, IncidentStatus, IncidentSeverity } from '@/app/types';

// Helper to map raw DB row to Incident type
const mapDBRowToIncident = (data: any): Incident => ({
  id: data.id,
  category: data.category as IncidentCategory,
  severity: data.severity_level as IncidentSeverity,
  status: (data.status as IncidentStatus) || 'Pending',
  location: {
    lat: data.lat,
    lon: data.lng,
  },
  description: data.description,
  reporterId: data.user_id,
  agencies_assigned: data.agencies_assigned,
  estimatedAffected: data.estimated_people_affected,
  img_url: data.img_url,
  timestamp: new Date(data.created_at),
  lastUpdated: new Date(data.created_at), // or updated_at if available
});

interface UseIncidentsReturn {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  filters: IncidentFilters;
  filteredIncidents: Incident[];
  createIncident: (incidentData: Omit<Incident, 'id' | 'timestamp' | 'lastUpdated' | 'img_url' | 'agencies_assigned'>, imageFile?: File) => Promise<boolean>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<boolean>;
  updateIncidentStatus: (id: string, status: Incident['status'], notes?: string) => Promise<boolean>;
  assignIncident: (id: string, assignedToId: string) => Promise<boolean>;
  setFilters: (filters: Partial<IncidentFilters>) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
}

const defaultFilters: IncidentFilters = {
  categories: [],
  severities: [],
  statuses: [],
};

export function useIncidents(): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<IncidentFilters>(defaultFilters);

  // Load incidents on mount
  useEffect(() => {
    loadIncidents();
  }, []);

  // Set up real-time event listening with Supabase
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel('incidents-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        (payload) => {
          console.log('Realtime change received:', payload);

          if (payload.eventType === 'INSERT') {
            const newIncident = mapDBRowToIncident(payload.new);
            setIncidents(prev => {
              // Avoid duplicates
              if (prev.some(i => i.id === newIncident.id)) return prev;

              const updated = [newIncident, ...prev];
              // Sort by date descending just in case
              return updated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            });
          } else {
            // For UPDATE/DELETE, simplest is to reload or map manually. 
            // Reloading is safer for consistency on intricate updates.
            loadIncidents(true);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Supabase Realtime Connection Status: ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadIncidents = async (silent: boolean = false): Promise<void> => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const data = await incidentService.getAll();
      setIncidents(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const createIncident = async (
    incidentData: Omit<Incident, 'id' | 'timestamp' | 'lastUpdated' | 'img_url' | 'agencies_assigned'>,
    imageFile?: File
  ): Promise<boolean> => {
    try {
      setError(null);
      // Optimistic update (optional, but good for UX)
      // Note: We don't have the full DB object yet (e.g. ID), so we might wait for the service response
      const newIncident = await incidentService.create(incidentData, imageFile);

      if (newIncident) {
        setIncidents(prev => [newIncident, ...prev]);
      }

      // Verification fetch
      await loadIncidents(true);
      return true;
    } catch (err) {
      console.error('Create incident error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create incident');
      return false;
    }
  };

  // Placeholder implementations for update/assign as they might not be fully in service yet
  const updateIncident = async (id: string, updates: Partial<Incident>): Promise<boolean> => {
    console.warn('updateIncident not fully implemented with backend yet');
    return true; // Mock success
  };

  const updateIncidentStatus = async (id: string, status: Incident['status'], notes?: string): Promise<boolean> => {
    try {
      await incidentService.updateStatus(id, status);
      return true;
    } catch (err) {
      return false;
    }
  };

  const assignIncident = async (id: string, assignedToId: string): Promise<boolean> => {
    console.warn('assignIncident not fully implemented with backend yet');
    return true;
  };

  const setFilters = useCallback((newFilters: Partial<IncidentFilters>): void => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback((): void => {
    setFiltersState(defaultFilters);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await loadIncidents();
  }, []);

  // Filter incidents based on current filters
  const filteredIncidents = incidents.filter(incident => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(incident.category)) {
      return false;
    }

    // Severity filter
    if (filters.severities.length > 0 && !filters.severities.includes(incident.severity)) {
      return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(incident.status)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const incidentDate = new Date(incident.timestamp);
      if (incidentDate < filters.dateRange.start || incidentDate > filters.dateRange.end) {
        return false;
      }
    }

    // Location filter
    if (filters.location) {
      const distance = calculateDistance(
        incident.location.lat,
        incident.location.lon,
        filters.location.center.lat,
        filters.location.center.lon
      );
      if (distance > filters.location.radius) {
        return false;
      }
    }

    // "My Incidents" filter
    if (filters.onlyMyIncidents && filters.reporterId) {
      if (incident.reporterId !== filters.reporterId) {
        return false;
      }
    }

    return true;
  });

  return {
    incidents,
    loading,
    error,
    filters,
    filteredIncidents,
    createIncident,
    updateIncident,
    updateIncidentStatus,
    assignIncident,
    setFilters,
    clearFilters,
    refresh,
  };
}

/**
 * Calculate distance between two coordinates in kilometers
 * Using Haversine formula for accuracy
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}