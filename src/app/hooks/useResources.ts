'use client';

/**
 * Custom hook for resource management with real-time updates
 * Provides centralized resource state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Resource, ResourceFilters, SystemEvent } from '@/app/types';
import { resourceService, eventService } from '@/app/services/mockDataService';

interface UseResourcesReturn {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  filters: ResourceFilters;
  filteredResources: Resource[];
  updateResource: (id: string, updates: Partial<Resource>) => Promise<boolean>;
  allocateToIncident: (resourceId: string, incidentId: string) => Promise<boolean>;
  releaseFromIncident: (resourceId: string) => Promise<boolean>;
  setFilters: (filters: Partial<ResourceFilters>) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
  getUtilizationRate: (resource: Resource) => number;
  getStatusColor: (status: Resource['status']) => string;
}

const defaultFilters: ResourceFilters = {
  types: [],
  statuses: [],
  availability: 'all',
};

export function useResources(): UseResourcesReturn {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ResourceFilters>(defaultFilters);

  // Load resources on mount
  useEffect(() => {
    loadResources();
  }, []);

  // Set up real-time event listening
  useEffect(() => {
    const unsubscribe = eventService.subscribe((event: SystemEvent) => {
      if (event.type === 'resource-updated') {
        const updatedResource = event.data as Resource;
        setResources(prevResources => {
          const existingIndex = prevResources.findIndex(res => res.id === updatedResource.id);
          if (existingIndex >= 0) {
            const updated = [...prevResources];
            updated[existingIndex] = updatedResource;
            return updated;
          }
          return prevResources;
        });
      }
    });

    return unsubscribe;
  }, []);

  const loadResources = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAll();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>): Promise<boolean> => {
    try {
      setError(null);
      const updated = await resourceService.update(id, updates);
      return updated !== null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resource');
      return false;
    }
  };

  const allocateToIncident = async (resourceId: string, incidentId: string): Promise<boolean> => {
    try {
      setError(null);
      const updated = await resourceService.allocateToIncident(resourceId, incidentId);
      return updated !== null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate resource');
      return false;
    }
  };

  const releaseFromIncident = async (resourceId: string): Promise<boolean> => {
    try {
      setError(null);
      const updated = await resourceService.releaseFromIncident(resourceId);
      return updated !== null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release resource');
      return false;
    }
  };

  const setFilters = useCallback((newFilters: Partial<ResourceFilters>): void => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback((): void => {
    setFiltersState(defaultFilters);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await loadResources();
  }, []);

  const getUtilizationRate = useCallback((resource: Resource): number => {
    return resource.capacity > 0 ? (resource.currentLoad / resource.capacity) * 100 : 0;
  }, []);

  const getStatusColor = useCallback((status: Resource['status']): string => {
    switch (status) {
      case 'Available':
        return 'text-green-600 bg-green-50';
      case 'Allocated':
        return 'text-yellow-600 bg-yellow-50';
      case 'Critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }, []);

  // Filter resources based on current filters
  const filteredResources = resources.filter(resource => {
    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(resource.type)) {
      return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(resource.status)) {
      return false;
    }

    // Availability filter
    if (filters.availability !== 'all') {
      if (filters.availability === 'available' && resource.status !== 'Available') {
        return false;
      }
      if (filters.availability === 'allocated' && resource.status !== 'Allocated') {
        return false;
      }
    }

    return true;
  });

  return {
    resources,
    loading,
    error,
    filters,
    filteredResources,
    updateResource,
    allocateToIncident,
    releaseFromIncident,
    setFilters,
    clearFilters,
    refresh,
    getUtilizationRate,
    getStatusColor,
  };
}