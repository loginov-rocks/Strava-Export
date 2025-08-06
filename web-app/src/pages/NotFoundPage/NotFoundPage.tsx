import { HomeOutlined } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { Link } from 'react-router';

import { PageContainer } from '../../components/PageContainer';

export const NotFoundPage = () => (
  <PageContainer>
    <Typography component="h1" variant="h3">404</Typography>
    <Button component={Link} startIcon={<HomeOutlined />} to="/" variant="outlined">Home</Button>
  </PageContainer>
);
