import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import type { SyncJob, SyncJobStatus } from '../../api/ApiClient';

interface Props {
  syncJobs: SyncJob[];
}

const STATUS_TO_COLOR_MAP: Record<SyncJobStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  created: 'info',
  started: 'warning',
  completed: 'success',
  failed: 'error',
};

export const SyncJobsTable = ({ syncJobs }: Props) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {syncJobs.map((syncJob) => (
          <TableRow key={syncJob.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>{new Date(syncJob.createdAt).toLocaleString()}</TableCell>
            <TableCell><Chip color={STATUS_TO_COLOR_MAP[syncJob.status]} label={syncJob.status} variant="outlined" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
