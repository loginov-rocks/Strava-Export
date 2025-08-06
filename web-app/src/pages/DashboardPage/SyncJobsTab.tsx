import { SyncOutlined, UpdateOutlined } from '@mui/icons-material';
import {
  Box, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress,
  Paper, TextField, Typography,
} from '@mui/material';
import { useState } from 'react';

import { useNotifications } from '../../hooks/useNotifications';
import { useSyncJobs } from '../../hooks/useSyncJobs';

import { SyncJobsTable } from './SyncJobsTable';

export const SyncJobsTab = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSyncLoading, setIsSyncLoading] = useState(false);
  const [refreshLastDaysString, setRefreshLastDaysString] = useState('');

  const { showNotification } = useNotifications();
  const { isLoading, isSyncRunning, scheduleSync, syncJobs } = useSyncJobs();

  const handleSync = async () => {
    setIsSyncLoading(true);

    try {
      await scheduleSync();
      showNotification('Sync successfully scheduled', 'info');
    } catch (error) {
      console.error('Failed to schedule sync:', error);
      showNotification('Failed to schedule sync', 'error');
    } finally {
      setIsSyncLoading(false);
    }
  };

  const handleSyncWithParams = async () => {
    const refreshLastDays = parseInt(refreshLastDaysString, 10);

    if (refreshLastDays <= 0) {
      showNotification('Refresh last days must be greater than zero', 'warning');
      return;
    }

    setIsSyncLoading(true);

    try {
      await scheduleSync({ refreshLastDays });
      setIsDialogOpen(false);
      showNotification('Sync successfully scheduled', 'info');
      setRefreshLastDaysString('');
    } catch (error) {
      console.error('Failed to schedule sync:', error);
      showNotification('Failed to schedule sync', 'error');
    } finally {
      setIsSyncLoading(false);
    }
  };

  return (
    <Paper>
      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <Box sx={{ padding: 2 }}>
            <ButtonGroup variant="outlined">
              <Button
                loading={isSyncLoading || isSyncRunning}
                loadingPosition="start"
                onClick={handleSync}
                startIcon={<SyncOutlined />}
              >
                Synchronize
              </Button>
              <Button
                loading={isSyncLoading || isSyncRunning}
                loadingPosition="start"
                onClick={() => setIsDialogOpen(true)}
                startIcon={<UpdateOutlined />}
              >
                With Parameters
              </Button>
            </ButtonGroup>
          </Box>
          {syncJobs.length > 0 ? (
            <SyncJobsTable syncJobs={syncJobs} />
          ) : (
            <Typography sx={{ padding: 2 }}>No synchronizations found</Typography>
          )}
          <Dialog onClose={() => setIsDialogOpen(false)} open={isDialogOpen}>
            <DialogTitle>Synchronize with Parameters</DialogTitle>
            <DialogContent>
              <DialogContentText>Enter refresh last days:</DialogContentText>
              <TextField
                autoFocus
                fullWidth
                label="Refresh last days"
                margin="dense"
                onChange={(e) => setRefreshLastDaysString(e.target.value)}
                required
                type="number"
                value={refreshLastDaysString}
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <ButtonGroup variant="outlined">
                <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button
                  disabled={parseInt(refreshLastDaysString, 10) <= 0}
                  loading={isSyncLoading || isSyncRunning}
                  loadingPosition="start"
                  onClick={handleSyncWithParams}
                >
                  Synchronize
                </Button>
              </ButtonGroup>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Paper>
  );
};
