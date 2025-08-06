import { LockOutlined, LogoutOutlined, PublicOutlined, ShareOutlined } from '@mui/icons-material';
import {
  Button, ButtonGroup, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

import api from '../../api';
import type { User } from '../../api/ApiClient';
import { UserCard } from '../../components/UserCard';
import { useNotifications } from '../../hooks/useNotifications';

interface Props {
  onLogout: () => void;
}

export const UserDetails = ({ onLogout }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { showNotification } = useNotifications();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.getUsersMe();
      setUser(response);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      showNotification('Failed to fetch user', 'error');
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!user) {
      return;
    }

    setIsLogoutLoading(true);

    try {
      await api.postAuthLogout();
      onLogout();
      showNotification('Logout successful', 'success');
    } catch (error) {
      console.error('Failed to logout:', error);
      showNotification('Failed to logout', 'error');
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) {
      return;
    }

    setIsUpdateLoading(true);

    try {
      const response = await api.patchUsersMe({ isPublic: !user.isPublic });
      setUser(response);
      showNotification('Update successful', 'success');
    } catch (error) {
      console.error('Failed to update user:', error);
      showNotification('Failed to update user', 'error');
    } finally {
      setIsUpdateLoading(false);
    }
  };

  if (isUserLoading) {
    return <CircularProgress />;
  }

  if (!user) {
    return null;
  }

  const shareUrl = `${window.location.href}@${user.stravaAthleteId}`;

  return (
    <>
      <UserCard
        action={
          <ButtonGroup variant="outlined">
            <Button
              onClick={() => setIsDialogOpen(true)}
              startIcon={<ShareOutlined />}
            >
              Share
            </Button>
            <Button
              loading={isUpdateLoading}
              loadingPosition="start"
              onClick={handleUpdate}
              startIcon={user.isPublic ? <LockOutlined /> : <PublicOutlined />}
            >
              Make {user.isPublic ? 'Private' : 'Public'}
            </Button>
            <Button
              loading={isLogoutLoading}
              loadingPosition="start"
              onClick={handleLogout}
              startIcon={<LogoutOutlined />}
            >
              Logout
            </Button>
          </ButtonGroup>
        }
        user={user}
      />
      <Dialog onClose={() => setIsDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>Share</DialogTitle>
        <DialogContent>
          <DialogContentText>Copy share URL:</DialogContentText>
          <TextField autoFocus fullWidth label="Share URL" margin="dense" value={shareUrl} variant="standard" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
