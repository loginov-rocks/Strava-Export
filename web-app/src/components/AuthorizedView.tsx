import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import api from '../api';
import { useNotifications } from '../hooks/useNotifications';
import { useSyncJobs } from '../hooks/useSyncJobs';
import { UserProfile } from './UserProfile';
import { ActivitiesTable } from './ActivitiesTable';
import { SyncJobsTable } from './SyncJobsTable';
import { SyncControls } from './SyncControls';
import { NotificationProvider } from './NotificationProvider';

interface AuthorizedViewProps {
  onLogout: () => void;
}

export const AuthorizedView = ({ onLogout }: AuthorizedViewProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { notification, showNotification, hideNotification } = useNotifications();
  
  const { 
    syncJobs, 
    loading: syncJobsLoading, 
    hasRunningSyncJobs,
    canSync,
    scheduleSync 
  } = useSyncJobs({
    onJobsCompleted: (completed, failed) => {
      if (completed > 0 && failed === 0) {
        showNotification(`All sync jobs completed successfully!`, 'success');
      } else if (failed > 0) {
        showNotification(`${completed} sync jobs completed, ${failed} failed.`, 'warning');
      }
    },
    onActivitiesRefreshNeeded: () => {
      // Trigger activities table refresh
      setRefreshTrigger(prev => prev + 1);
    }
  });

  const handleLogout = async () => {
    await api.postAuthLogout();
    onLogout();
    showNotification('Logged out successfully!', 'success');
  };

  const handleSync = async (refreshLastDays?: number) => {
    await scheduleSync(refreshLastDays);
  };

  return (
    <Box>
      <UserProfile onNotification={showNotification} />
      
      <SyncControls
        hasRunningSyncJobs={hasRunningSyncJobs}
        canSync={canSync}
        onLogout={handleLogout}
        onSync={handleSync}
        onNotification={showNotification}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="Activities" />
          <Tab label="Sync Jobs" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Last Week Activities
          </Typography>
          <ActivitiesTable refreshTrigger={refreshTrigger} />
        </Box>
      )}

      {currentTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Sync Jobs
          </Typography>
          <SyncJobsTable syncJobs={syncJobs} loading={syncJobsLoading} />
        </Box>
      )}

      <NotificationProvider
        notification={notification}
        onClose={hideNotification}
      />
    </Box>
  );
};
