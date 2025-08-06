import { useEffect, useState } from 'react';
import { LinearProgress, Paper, Typography } from '@mui/material';

import api from '../../api';
import type { Activity } from '../../api/ApiClient';
import { useNotifications } from '../../hooks/useNotifications';

import { ActivitiesTable } from './ActivitiesTable';

export const ActivitiesTab = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { showNotification } = useNotifications();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.getActivities({ lastMonths: 1 });
      setActivities(response.activities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      showNotification('Failed to fetch activities', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper>
      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <Typography sx={{ padding: 2 }}>
            {activities.length > 0 ? 'Activities for the last month:': 'No activities found for the last month'}
          </Typography>
          {activities.length > 0 && <ActivitiesTable activities={activities} />}
        </>
      )}      
    </Paper>
  );
};
