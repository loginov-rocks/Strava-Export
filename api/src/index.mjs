import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { PORT, STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET, WEB_APP_URL } from './constants.mjs';
import { StravaApi } from './stravaApi.mjs';
import { SyncService } from './syncService.mjs';

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

const syncService = new SyncService();

app.get('/auth/client-credentials', (req, res) => {
  return res.send({
    clientId: STRAVA_API_CLIENT_ID,
  });
});

app.post('/auth/exchange-code', async (req, res) => {
  const { code } = req.body;

  let tokenResponse;
  try {
    tokenResponse = await stravaApi.token(code);
  } catch (error) {
    console.error(error);

    return res.status(401).send({ message: 'Unauthorized' });
  }

  return res.send(tokenResponse);
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

  const { athleteId } = req.body;

  if (!athleteId) {
    return res.status(404).send({ message: 'Bad Request' });
  }

  const job = await syncService.findJob({ athleteId });

  if (job && job.status === 'created') {
    syncService.startJob(job.id);
  }

  if (!job) {
    const jobId = await syncService.createJob(athleteId, token);
    syncService.startJob(jobId);
  }

  return res.status(201).send();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
