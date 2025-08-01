import { useState, useEffect } from 'react';
import { Typography, CircularProgress, Box, IconButton, Button } from '@mui/material';
import { LocationOn, Public, Lock } from '@mui/icons-material';
import api from '../api';

interface UserDetails {
  stravaAthleteId: string;
  isPublic: boolean;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  avatarUrl: string | null;
}

interface UserProfileProps {
  onNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
}

export const UserProfile = ({ onNotification }: UserProfileProps) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const details = await api.getUsersMe();
      setUserDetails(details);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivacy = async () => {
    if (!userDetails) return;

    try {
      const updatedUser = await api.patchUsersMe({ isPublic: !userDetails.isPublic });
      setUserDetails(updatedUser);
      onNotification(
        `Profile is now ${updatedUser.isPublic ? 'public' : 'private'}`,
        'success'
      );
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
      onNotification('Failed to update privacy setting', 'error');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!userDetails) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Welcome{userDetails.firstName || userDetails.lastName ? `, ${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() : ''}!
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {userDetails.avatarUrl && (
          <img 
            src={userDetails.avatarUrl} 
            alt="Profile" 
            style={{ width: 64, height: 64, borderRadius: '50%' }}
          />
        )}
        <Box>
          <Typography variant="body1">
            Strava Athlete ID: {userDetails.stravaAthleteId}
          </Typography>
          {(userDetails.city || userDetails.state || userDetails.country) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body1">
                {[userDetails.city, userDetails.state, userDetails.country].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          )}
          {userDetails.bio && (
            <Typography variant="body2" color="text.secondary">
              {userDetails.bio}
            </Typography>
          )}
          <Box sx={{ mt: 1 }}>
            <Button 
              size="small" 
              variant="outlined"
              color={userDetails.isPublic ? "primary" : "default"}
              startIcon={userDetails.isPublic ? <Public fontSize="small" /> : <Lock fontSize="small" />}
              onClick={handleTogglePrivacy}
            >
              Make {userDetails.isPublic ? 'Private' : 'Public'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};