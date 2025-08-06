import { DirectionsRunOutlined, SyncOutlined } from '@mui/icons-material';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { PageContainer } from '../../components/PageContainer';

import { ActivitiesTab } from './ActivitiesTab';
import { SyncJobsTab } from './SyncJobsTab';
import { UserDetails } from './UserDetails';

interface AuthorizedViewProps {
  onLogout: () => void;
}

export const DashboardPage = ({ onLogout }: AuthorizedViewProps) => {
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <PageContainer>
      <UserDetails onLogout={onLogout} />
      <Box sx={{ marginTop: 4 }}>
        <Tabs onChange={handleChange} value={value} variant="fullWidth">
          <Tab icon={<DirectionsRunOutlined />} label="Activities" />
          <Tab icon={<SyncOutlined />} label="Syncs" />
        </Tabs>
        {value === 0 && <ActivitiesTab />}
        {value === 1 && <SyncJobsTab />}
      </Box>
    </PageContainer>
  );
};
