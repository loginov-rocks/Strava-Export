import { CircularProgress, CssBaseline, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import api from '../api';

import { AuthorizedView } from './AuthorizedView';
import { GuestView } from './GuestView';

export const App = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthMe();
  }, []);

  const fetchAuthMe = async () => {
    setLoading(true);

    try {
      await api.getAuthMe();
      setIsAuthorized(true);
    } catch (error) {
      console.error('Failed to fetch auth me:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    setIsAuthorized(false);
  }

  return (
    <>
      <CssBaseline />
      <Container>
        <Typography component="h1" variant="h4">Stravaholics</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          isAuthorized ? <AuthorizedView onLogout={handleLogout} /> : <GuestView />
        )}
      </Container>
    </>
  );
};
