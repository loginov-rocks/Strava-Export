import { useEffect, useState } from 'react';

import { ApiClient } from './ApiClient';

const apiClient = new ApiClient({
  baseUrl: window.location.hostname === 'localhost' ? 'http://localhost:3001'
    : 'https://stravaholics-api.up.railway.app',
});

export const App = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  const getAuthMe = async () => {
    try {
      await apiClient.getAuthMe();
      setIsAuthorized(true);
    } catch {
      setIsAuthorized(false);
    }
  }

  useEffect(() => {
    getAuthMe();
  }, []);

  const handleAuthorize = () => {
    window.location.href = apiClient.getLoginUrl();
  };

  const handleLogout = async () => {
    if (!isAuthorized) {
      return alert('User is already logged out!');
    }

    await apiClient.postAuthLogout();
    setIsAuthorized(false);
    alert('Logged out!');
  };

  const handleSync = async () => {
    if (!isAuthorized) {
      return alert('User is logged out!');
    }

    await apiClient.postSyncJob();

    alert('Sync scheduled!');
  };

  return (
    <>
      <h1>Strava Export</h1>
      <button onClick={handleAuthorize}>Authorize</button>
      {' '}
      <button onClick={handleLogout}>Logout</button>
      {' '}
      <button onClick={handleSync}>Sync</button>
    </>
  );
};
