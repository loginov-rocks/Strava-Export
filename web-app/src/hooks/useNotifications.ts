import { use } from 'react';

import { NotificationsContext } from '../contexts/NotificationsContext';

export const useNotifications = () => use(NotificationsContext);
