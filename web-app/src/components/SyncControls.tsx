import { useState } from 'react';
import { Button, Box, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';

interface SyncControlsProps {
  hasRunningSyncJobs: boolean;
  canSync: boolean;
  onLogout: () => void;
  onSync: (refreshLastDays?: number) => Promise<void>;
  onNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SyncControls = ({ hasRunningSyncJobs, canSync, onLogout, onSync, onNotification }: SyncControlsProps) => {
  const [syncMenuAnchor, setSyncMenuAnchor] = useState<null | HTMLElement>(null);
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
  const [refreshDays, setRefreshDays] = useState<string>('');

  const handleLogout = async () => {
    await onLogout();
  };

  const handleSyncMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setSyncMenuAnchor(event.currentTarget);
  };

  const handleSyncMenuClose = () => {
    setSyncMenuAnchor(null);
  };

  const handleRegularSync = async () => {
    handleSyncMenuClose();
    try {
      await onSync();
      onNotification('Sync scheduled!', 'info');
    } catch (error) {
      console.error('Failed to schedule sync:', error);
      onNotification('Failed to schedule sync', 'error');
    }
  };

  const handleRefreshSync = () => {
    handleSyncMenuClose();
    setRefreshDialogOpen(true);
  };

  const handleRefreshDialogClose = () => {
    setRefreshDialogOpen(false);
    setRefreshDays('');
  };

  const handleRefreshDialogConfirm = async () => {
    const days = parseInt(refreshDays, 10);
    if (days > 0) {
      try {
        await onSync(days);
        onNotification(`Sync with ${days}-day refresh scheduled!`, 'info');
        handleRefreshDialogClose();
      } catch (error) {
        console.error('Failed to schedule sync:', error);
        onNotification('Failed to schedule sync', 'error');
      }
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button onClick={handleLogout} variant="contained">
          Logout
        </Button>
        <Button
          onClick={handleSyncMenuClick}
          variant="contained"
          endIcon={<ArrowDropDown />}
          disabled={!canSync || hasRunningSyncJobs}
        >
          {!canSync ? 'Loading...' : hasRunningSyncJobs ? 'Sync Running...' : 'Sync'}
        </Button>
        <Menu
          anchorEl={syncMenuAnchor}
          open={Boolean(syncMenuAnchor)}
          onClose={handleSyncMenuClose}
        >
          <MenuItem onClick={handleRegularSync}>Regular Sync</MenuItem>
          <MenuItem onClick={handleRefreshSync}>Sync with Refresh</MenuItem>
        </Menu>
      </Box>

      <Dialog open={refreshDialogOpen} onClose={handleRefreshDialogClose}>
        <DialogTitle>Sync with Refresh</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the number of days to refresh activity details for:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Days to refresh"
            type="number"
            fullWidth
            variant="outlined"
            value={refreshDays}
            onChange={(e) => setRefreshDays(e.target.value)}
            inputProps={{ min: 1, max: 365 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRefreshDialogClose}>Cancel</Button>
          <Button 
            onClick={handleRefreshDialogConfirm} 
            variant="contained"
            disabled={!refreshDays || parseInt(refreshDays, 10) <= 0}
          >
            Start Sync
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};