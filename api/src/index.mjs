import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { StravaApiClient } from './clients/StravaApiClient.mjs';
import { ActivitiesController } from './controllers/ActivitiesController.mjs';
import { AuthController } from './controllers/AuthController.mjs';
import { StravaController } from './controllers/StravaController.mjs';
import { ActivityRepository } from './repositories/ActivityRepository.mjs';
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

const activityRepository = new ActivityRepository();

const stravaSyncService = new StravaSyncService({
  activityRepository,
  stravaApiClient,
});

const activitiesController = new ActivitiesController({
  activityRepository,
});

const authController = new AuthController({
  stravaApiClient,
  stravaApiClientId: STRAVA_API_CLIENT_ID,
});

const stravaController = new StravaController({
  stravaSyncService,
});

app.get('/activities', activitiesController.getActivities);

app.get('/auth/client-credentials', authController.getClientCredentials);
app.post('/auth/exchange-code', authController.postExchangeCode);

app.get('/strava/process-activities', stravaController.getProcessActivities);
app.post('/strava/sync', stravaController.postSync);

connectDatabase(MONGOOSE_CONNECT_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`);
    });
  });
