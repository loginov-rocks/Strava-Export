import { Button } from '@mui/material';

import api from '../api';

export const GuestView = () => {
  const handleAuthorize = () => {
    window.location.href = api.getLoginUrl();
  };

  return (
    <Button onClick={handleAuthorize} variant="contained">Authorize</Button>
  );
};
