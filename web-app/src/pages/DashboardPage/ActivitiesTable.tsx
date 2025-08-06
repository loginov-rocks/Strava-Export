import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import type { Activity } from '../../api/ApiClient';

interface Props {
  activities: Activity[];
}

export const ActivitiesTable = ({ activities }: Props) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Sport</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Distance (km)</TableCell>
          <TableCell>Time (min)</TableCell>
          <TableCell>Average Speed (km/h)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>{new Date(activity.startDateTime).toLocaleString()}</TableCell>
            <TableCell>{activity.sportType}</TableCell>
            <TableCell>{activity.name}</TableCell>
            <TableCell>{activity.distanceKilometers || '-'}</TableCell>
            <TableCell>{activity.movingTimeMinutes || '-'}</TableCell>
            <TableCell>{activity.averageSpeedKilometersPerHour || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
