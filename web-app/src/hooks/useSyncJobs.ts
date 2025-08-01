import { useState, useEffect, useRef } from 'react';
import api from '../api';

export interface SyncJob {
  id: string;
  userId: string;
  status: 'created' | 'started' | 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
}

interface SyncJobsResponse {
  syncJobsCount: number;
  syncJobs: SyncJob[];
}

interface UseSyncJobsProps {
  onJobsCompleted?: (completed: number, failed: number) => void;
  onActivitiesRefreshNeeded?: () => void;
}

export const useSyncJobs = ({ onJobsCompleted, onActivitiesRefreshNeeded }: UseSyncJobsProps = {}) => {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if any sync jobs are currently running
  const hasRunningSyncJobs = syncJobs.some(job => job.status === 'created' || job.status === 'started');

  const fetchSyncJobs = async () => {
    try {
      const response: SyncJobsResponse = await api.getSyncJobs();
      setSyncJobs(response.syncJobs);
    } catch (error) {
      console.error('Failed to fetch sync jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const pollSyncJobs = async () => {
    try {
      const response: SyncJobsResponse = await api.getSyncJobs();
      const freshSyncJobs = response.syncJobs;
      setSyncJobs(freshSyncJobs);
      
      // Check if any jobs are still running
      const stillRunning = freshSyncJobs.some(job => job.status === 'created' || job.status === 'started');
      
      if (!stillRunning) {
        // All jobs finished, stop polling
        stopPolling();
        // Refresh activities after sync completion
        onActivitiesRefreshNeeded?.();
        
        const completed = freshSyncJobs.filter(job => job.status === 'completed').length;
        const failed = freshSyncJobs.filter(job => job.status === 'failed').length;
        
        onJobsCompleted?.(completed, failed);
      }
    } catch (error) {
      console.error('Failed to poll sync jobs:', error);
      stopPolling();
    }
  };

  const startPolling = (intervalMs: number = 3000) => {
    // Clear any existing polling first
    stopPolling();
    
    const interval = setInterval(() => {
      pollSyncJobs();
    }, intervalMs);
    pollingIntervalRef.current = interval;
  };

  const scheduleSync = async (refreshLastDays?: number): Promise<SyncJob> => {
    const syncJob: SyncJob = await api.postSyncJob(refreshLastDays ? { refreshLastDays } : undefined);
    // Refresh sync jobs table immediately
    fetchSyncJobs();
    // Start polling if not already running
    if (!pollingIntervalRef.current) {
      startPolling();
    }
    return syncJob;
  };

  // Initialize by fetching sync jobs
  useEffect(() => {
    fetchSyncJobs();
  }, []);

  // Auto-start polling if there are running sync jobs on load
  useEffect(() => {
    const runningSyncJobs = syncJobs.some(job => job.status === 'created' || job.status === 'started');
    
    if (runningSyncJobs && !pollingIntervalRef.current) {
      // Auto-start polling if there are running jobs and no polling is active
      startPolling();
    } else if (!runningSyncJobs && pollingIntervalRef.current) {
      // Stop polling if no running jobs but polling is active
      stopPolling();
    }
  }, [syncJobs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    syncJobs,
    loading,
    hasRunningSyncJobs,
    // Disable sync operations until we have initial data
    canSync: !loading,
    fetchSyncJobs,
    scheduleSync,
    startPolling,
    stopPolling,
  };
};