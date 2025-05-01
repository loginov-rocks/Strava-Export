import { Api } from './api.mjs';
import { StravaApi } from './stravaApi.mjs';

const interceptAuthCode = (callback) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const authCode = urlSearchParams.get('code');

  if (authCode) {
    callback(authCode);
  }
};

window.addEventListener('load', async () => {
  const api = new Api({
    baseUrl: API_BASE_URL,
  });

  api.restoreAuthData();

  document.getElementById('authorize').addEventListener('click', async () => {
    let clientCredentials;
    try {
      clientCredentials = await api.authClientCredentials();
    } catch (error) {
      alert(error);

      return;
    }

    const stravaApi = new StravaApi({
      baseUrl: STRAVA_API_BASE_URL,
      clientId: clientCredentials.clientId,
      redirectUri: STRAVA_API_REDIRECT_URI,
    });

    stravaApi.authorize();
  });

  document.getElementById('logout').addEventListener('click', () => {
    api.removeAuthData();
  });

  document.getElementById('sync').addEventListener('click', async () => {
    try {
      await api.stravaSync();
    } catch (error) {
      alert(error);
    }
  });

  interceptAuthCode(async (authCode) => {
    let authData;
    try {
      authData = await api.authExchangeCode(authCode);
    } catch (error) {
      alert(error);

      return;
    }

    api.setAuthData(authData);
  });
});
