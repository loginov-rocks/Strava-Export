import { Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { SyncJob } from '../hooks/useSyncJobs';

interface SyncJobsTableProps {
  syncJobs: SyncJob[];
  loading: boolean;
}

export const SyncJobsTable = ({ syncJobs, loading }: SyncJobsTableProps) => {
  if (loading) {
    return <CircularProgress />;
  }

  if (syncJobs.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No sync jobs found.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Job ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Started At</TableCell>
            <TableCell>Completed At</TableCell>
            <TableCell>Duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {syncJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8em' }}>
                {job.id.substring(0, 8)}...
              </TableCell>
              <TableCell>
                <Chip 
                  label={job.status} 
                  size="small"
                  color={
                    job.status === 'completed' ? 'success' :
                    job.status === 'failed' ? 'error' :
                    job.status === 'started' ? 'primary' : 'default'
                  }
                />
              </TableCell>
              <TableCell>
                {job.startedAt ? new Date(job.startedAt).toLocaleString() : '-'}
              </TableCell>
              <TableCell>
                {job.completedAt ? new Date(job.completedAt).toLocaleString() : 
                 job.failedAt ? new Date(job.failedAt).toLocaleString() : '-'}
              </TableCell>
              <TableCell>
                {job.startedAt && (job.completedAt || job.failedAt) 
                  ? `${Math.round((new Date(job.completedAt || job.failedAt!).getTime() - new Date(job.startedAt).getTime()) / 1000)}s`
                  : job.startedAt && (job.status === 'started') 
                  ? `${Math.round((Date.now() - new Date(job.startedAt).getTime()) / 1000)}s`
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};