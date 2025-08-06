import { LoginOutlined } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { Link } from 'react-router';

import api from '../../api';
import { PageContainer } from '../../components/PageContainer';

export const GuestPage = () => {
  const loginUrl = api.getAuthLoginUrl();

  return (
    <PageContainer>
      <Typography component="h1" variant="h3">Stravaholics</Typography>
      <Button component={Link} startIcon={<LoginOutlined />} to={loginUrl} variant="outlined">Authorize</Button>
    </PageContainer>
  );
};
