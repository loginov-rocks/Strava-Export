import { useState, type ReactNode } from 'react';

import { type Notification, NotificationsContext, type NotificationSeverity } from '../contexts/NotificationsContext';

interface Props {
  children?: ReactNode;
}

export const NotificationsProvider = ({ children }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, severity?: NotificationSeverity) => {
    const notification = {
      id: Date.now().toString(),
      message,
      severity,
    };

    setNotifications((prev) => [...prev, notification]);
  };

  const hideNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const contextValue = { notifications, showNotification, hideNotification };

  return (
    <NotificationsContext value={contextValue}>
      {children}
    </NotificationsContext>
  );
};
