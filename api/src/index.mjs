import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { StravaApiClient } from './clients/StravaApiClient.mjs';
import { StravaSyncService } from './services/StravaSyncService.mjs';

import {
  MONGOOSE_CONNECT_URI, PORT, STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET, WEB_APP_URL,
} from './constants.mjs';
import { connect as connectDatabase } from './database.mjs';

const app = express();

app.use(cors({
  origin: WEB_APP_URL,
}));

app.use(express.json());

const stravaApiClient = new StravaApiClient({
  baseUrl: STRAVA_API_BASE_URL,
  clientId: STRAVA_API_CLIENT_ID,
  clientSecret: STRAVA_API_CLIENT_SECRET,
});

const stravaSyncService = new StravaSyncService();

app.get('/auth/client-credentials', (req, res) => {
  return res.send({
    clientId: STRAVA_API_CLIENT_ID,
  });
});

app.post('/auth/exchange-code', async (req, res) => {
  const { code } = req.body;

  let response;
  try {
    response = await stravaApiClient.token(code);
  } catch (error) {
    console.error(error);

    return res.status(401).send({ message: 'Unauthorized' });
  }

  return res.send(response);
});

app.post('/strava/sync', async (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  // TODO: Validate the token and the user's access to the passed athlete ID.
  const { athleteId } = req.body;

  if (!athleteId) {
    return res.status(404).send({ message: 'Bad Request' });
  }

  let job;
  try {
    job = await stravaSyncService.createJob({ athleteId, accessToken: token });
  } catch (error) {
    console.error(error);

    return res.status(500).send({ message: 'Internal Server Error' });
  }

  return res.status(200).send({
    jobId: job.id,
  });
});

connectDatabase(MONGOOSE_CONNECT_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`);
    });
  });
