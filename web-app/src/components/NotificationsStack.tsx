import { Alert, Snackbar } from '@mui/material';

import { useNotifications } from '../hooks/useNotifications';

export const NotificationsStack = () => {
  const { notifications, hideNotification } = useNotifications();

  return notifications.map(({ id, message, severity }) => (
    <Snackbar
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      autoHideDuration={6000}
      key={id}
      onClose={() => hideNotification(id)}
      open={true}
    >
      <Alert
        onClose={() => hideNotification(id)}
        severity={severity ? severity : 'info'}
        sx={{ width: '100%' }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  ));
};
