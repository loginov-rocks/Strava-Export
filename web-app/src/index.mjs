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

  interceptAuthCode(async (authCode) => {
    let authData;
    try {
      authData = await api.authExchangeCode(authCode);
    } catch (error) {
      alert(error);

      return;
    }

    console.log(authData);
  });
});
