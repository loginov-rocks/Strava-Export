import { ApiClient } from './ApiClient.mjs';
import { App } from './App.mjs';

window.addEventListener('load', () => {
  const apiClient = new ApiClient({
    baseUrl: API_URL,
  });

  const app = new App({
    apiClient,
  });

  document.getElementById('authorize').addEventListener('click', app.onAuthorizeClick);
  document.getElementById('logout').addEventListener('click', app.onLogoutClick);
  document.getElementById('sync').addEventListener('click', app.onSyncClick);

  app.start();
});
