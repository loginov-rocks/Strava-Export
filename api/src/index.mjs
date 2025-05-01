import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { PORT, STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET, WEB_APP_URL } from './constants.mjs';
import { StravaApi } from './stravaApi.mjs';

const app = express();

app.use(cors({
  origin: WEB_APP_URL,
}));

app.use(express.json());

const stravaApi = new StravaApi({
  baseUrl: STRAVA_API_BASE_URL,
  clientId: STRAVA_API_CLIENT_ID,
  clientSecret: STRAVA_API_CLIENT_SECRET,
});

app.get('/auth/client-credentials', (req, res) => {
  res.send({
    clientId: STRAVA_API_CLIENT_ID,
  });
});

app.post('/auth/exchange-code', async (req, res) => {
  const { code } = req.body;

  const tokenResponse = await stravaApi.token(code);

  return res.send(tokenResponse);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
