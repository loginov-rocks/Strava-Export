import { Container } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const PageContainer = ({ children }: Props) => (
  <Container sx={{ marginTop: 4, marginBottom: 4 }}>
    {children}
  </Container>
);
