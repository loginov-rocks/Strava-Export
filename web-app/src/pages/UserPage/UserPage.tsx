import { HomeOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import api from '../../api';
import type { User } from '../../api/ApiClient';
import { PageContainer } from '../../components/PageContainer';
import { UserCard } from '../../components/UserCard';

import { NotFoundPage } from '../NotFoundPage/NotFoundPage';

export const UserPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { handle } = useParams();

  useEffect(() => {
    if (handle && handle.startsWith('@') && handle.length > 1) {
      fetchUser(handle.substring(1));
    }
  }, [handle]);

  const fetchUser = async (stravaAthleteId: string) => {
    try {
      const response = await api.getUser(stravaAthleteId);
      setUser(response);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!handle || !handle.startsWith('@') || handle.length <= 1 || (!isLoading && !user)) {
    return <NotFoundPage />;
  }

  return (
    <PageContainer>
      <Button component={Link} startIcon={<HomeOutlined />} to="/" variant="outlined">Home</Button>
      {user ? <UserCard user={user} /> : <CircularProgress />}
    </PageContainer>
  );
};
