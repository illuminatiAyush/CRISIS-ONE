'use client';

/**
 * Custom hook for alert management with real-time updates
 * Handles critical notifications and system alerts
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert, SystemEvent } from '@/app/types';
import { alertService, eventService } from '@/app/services/mockDataService';

interface UseAlertsReturn {
  alerts: Alert[];
  unacknowledgedCount: number;
  loading: boolean;
  error: string | null;
  acknowledgeAlert: (id: string) => Promise<boolean>;
  acknowledgeAll: () => Promise<void>;
  refresh: () => Promise<void>;
  getMostCriticalAlert: () => Alert | null;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load alerts on mount
  useEffect(() => {
    loadAlerts();
  }, []);

  // Set up real-time event listening for new alerts
  useEffect(() => {
    const unsubscribe = eventService.subscribe((event: SystemEvent) => {
      if (event.type === 'alert-created') {
        const newAlert = event.data as Alert;
        setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
      }
    });

    return unsubscribe;
  }, []);

  const loadAlerts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertService.getAll();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const updated = await alertService.acknowledge(id);
      if (updated) {
        setAlerts(prevAlerts =>
          prevAlerts.map(alert =>
            alert.id === id ? { ...alert, acknowledged: true } : alert
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
      return false;
    }
  };

  const acknowledgeAll = async (): Promise<void> => {
    try {
      setError(null);
      const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
      
      // Acknowledge all unacknowledged alerts
      const acknowledgmentPromises = unacknowledgedAlerts.map(alert =>
        alertService.acknowledge(alert.id)
      );
      
      await Promise.all(acknowledgmentPromises);
      
      // Update local state
      setAlerts(prevAlerts =>
        prevAlerts.map(alert => ({ ...alert, acknowledged: true }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge all alerts');
    }
  };

  const refresh = useCallback(async (): Promise<void> => {
    await loadAlerts();
  }, []);

  const getMostCriticalAlert = useCallback((): Alert | null => {
    const unacknowledged = alerts.filter(alert => !alert.acknowledged);
    
    if (unacknowledged.length === 0) return null;
    
    // Sort by severity priority and then by timestamp
    const severityPriority = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    
    return unacknowledged.sort((a, b) => {
      const severityDiff = severityPriority[b.severity] - severityPriority[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    })[0];
  }, [alerts]);

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  return {
    alerts,
    unacknowledgedCount,
    loading,
    error,
    acknowledgeAlert,
    acknowledgeAll,
    refresh,
    getMostCriticalAlert,
  };
}