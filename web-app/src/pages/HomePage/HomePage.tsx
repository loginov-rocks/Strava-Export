import { CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';

import api from '../../api';
import { PageContainer } from '../../components/PageContainer';

import { DashboardPage } from '../DashboardPage/DashboardPage';
import { GuestPage } from '../GuestPage/GuestPage';

export const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuthMe();
  }, []);

  const fetchAuthMe = async () => {
    setIsLoading(true);

    try {
      await api.getAuthMe();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch auth me:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <CircularProgress />
      </PageContainer>
    );
  }

  if (isAuthenticated) {
    return <DashboardPage onLogout={handleLogout} />;
  }

  return <GuestPage />;
};
