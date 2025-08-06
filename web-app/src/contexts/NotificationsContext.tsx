import type { AlertColor } from '@mui/material';
import { createContext } from 'react';

export type NotificationSeverity = AlertColor;

export interface Notification {
  id: string;
  message: string;
  severity?: NotificationSeverity;
}

export interface NotificationsContextType {
  notifications: Notification[];
  showNotification: (message: string, severity?: AlertColor) => void;
  hideNotification: (id: string) => void;
}

export const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  showNotification: () => undefined,
  hideNotification: () => undefined,
});
