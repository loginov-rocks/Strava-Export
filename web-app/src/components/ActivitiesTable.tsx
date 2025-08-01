import { useState, useEffect } from 'react';
import { Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../api';

interface Activity {
  id: string;
  name: string;
  sportType: string;
  startDateTime: string;
  distanceKilometers: number;
  movingTimeMinutes: number;
  totalElevationGainMeters: number;
  averageSpeedKilometersPerHour: number;
}

interface ActivitiesResponse {
  activitiesCount: number;
  activities: Activity[];
}

interface ActivitiesTableProps {
  refreshTrigger?: number; // Can be used to trigger refresh from parent
}

export const ActivitiesTable = ({ refreshTrigger }: ActivitiesTableProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const response: ActivitiesResponse = await api.getActivities({ lastWeeks: 1 });
      setActivities(response.activities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchActivities();
    }
  }, [refreshTrigger]);

  // Expose fetchActivities function to parent via ref
  const refresh = () => {
    fetchActivities();
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (activities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No activities found for the last week.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Sport</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Distance (km)</TableCell>
            <TableCell align="right">Time (min)</TableCell>
            <TableCell align="right">Elevation (m)</TableCell>
            <TableCell align="right">Avg Speed (km/h)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>{activity.name}</TableCell>
              <TableCell>{activity.sportType}</TableCell>
              <TableCell>
                {new Date(activity.startDateTime).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                {activity.distanceKilometers?.toFixed(2) || '-'}
              </TableCell>
              <TableCell align="right">
                {activity.movingTimeMinutes?.toFixed(0) || '-'}
              </TableCell>
              <TableCell align="right">
                {activity.totalElevationGainMeters?.toFixed(0) || '-'}
              </TableCell>
              <TableCell align="right">
                {activity.averageSpeedKilometersPerHour?.toFixed(2) || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Export the refresh function type for use with refs
export type ActivitiesTableRef = {
  refresh: () => void;
};