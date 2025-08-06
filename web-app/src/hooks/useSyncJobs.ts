import { useState, useEffect, useRef } from 'react';

import api from '../api';
import type { SyncJob } from '../api/ApiClient';

import { useNotifications } from './useNotifications';

export const useSyncJobs = () => {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(0);
  const { showNotification } = useNotifications();

  useEffect(() => {
    // Fetch on mount.
    fetchSyncJobs();

    // Cleanup on unmount.
    return () => {
      stopPolling();
    };
  }, []);

  // Calculate if any of the sync jobs are running.
  const isSyncRunning = syncJobs.some(({ status }) => ['created', 'started'].includes(status));

  // Whenever running status changes...
  useEffect(() => {
    // Start polling if any of the sync jobs are running.
    if (isSyncRunning && intervalRef.current === 0) {
      startPolling();
    }
    // Stop otherwise.
    else if (!isSyncRunning && intervalRef.current > 0) {
      stopPolling();
      // Polling was engaged, meaning sync jobs were running, but it's now complete, so we can communicate the results.
      showNotification('Sync successfully completed', 'success');
    }
  }, [isSyncRunning]);

  const fetchSyncJobs = async () => {
    try {
      const response = await api.getSyncJobs();
      setSyncJobs(response.syncJobs);
    } catch (error) {
      console.error('Failed to fetch sync jobs:', error);
      showNotification('Failed to fetch sync jobs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    stopPolling();
    intervalRef.current = setInterval(() => {
      fetchSyncJobs();
    }, 3000);
  };

  const stopPolling = () => {
    if (intervalRef.current > 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = 0;
    }
  };

  const scheduleSync = async (params?: { refreshLastDays?: number }) => {
    const syncJob = await api.postSyncJob(params && params.refreshLastDays ? params : undefined);
    // Unshift the new sync job; this will trigger recalculation of the statuses and start polling.
    setSyncJobs((prev) => [syncJob, ...prev]);
  };

  return { isLoading, isSyncRunning, scheduleSync, syncJobs };
};
