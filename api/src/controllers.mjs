import { STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET } from './constants.mjs';

import { StravaApiClient } from './clients/StravaApiClient.mjs';

import { ActivitiesController } from './controllers/ActivitiesController.mjs';
import { AuthController } from './controllers/AuthController.mjs';
import { StravaController } from './controllers/StravaController.mjs';

import { activityModel } from './models/activityModel.mjs';
import { stravaSyncJobModel } from './models/stravaSyncJobModel.mjs';

import { ActivityRepository } from './repositories/ActivityRepository.mjs';
import { StravaSyncJobRepository } from './repositories/StravaSyncJobRepository.mjs';

import { StravaSyncService } from './services/StravaSyncService.mjs';

// API clients.
const stravaApiClient = new StravaApiClient({
  baseUrl: STRAVA_API_BASE_URL,
  clientId: STRAVA_API_CLIENT_ID,
  clientSecret: STRAVA_API_CLIENT_SECRET,
});

// Repositories.
const activityRepository = new ActivityRepository({
  activityModel,
});

const stravaSyncJobRepository = new StravaSyncJobRepository({
  stravaSyncJobModel,
});

// Services.
const stravaSyncService = new StravaSyncService({
  activityRepository,
  stravaApiClient,
  stravaSyncJobRepository,
});

// Controllers.
export const activitiesController = new ActivitiesController({
  activityRepository,
});

export const authController = new AuthController({
  stravaApiClient,
});

export const stravaController = new StravaController({
  stravaSyncService,
});
