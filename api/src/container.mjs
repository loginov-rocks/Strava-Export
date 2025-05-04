import { STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET } from './constants.mjs';

import { StravaApiClient } from './clients/StravaApiClient.mjs';

import { ActivitiesController } from './controllers/ActivitiesController.mjs';
import { AuthController } from './controllers/AuthController.mjs';
import { SyncController } from './controllers/SyncController.mjs';

import { activityModel } from './models/activityModel.mjs';
import { jobModel } from './models/jobModel.mjs';

import { SyncProcessor } from './processors/SyncProcessor.mjs';

import { ActivityRepository } from './repositories/ActivityRepository.mjs';
import { JobRepository } from './repositories/JobRepository.mjs';

import { SyncService } from './services/SyncService.mjs';

import { syncQueue } from './queue.mjs';

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

export const jobRepository = new JobRepository({
  jobModel,
});

// Processors.
export const syncProcessor = new SyncProcessor({
  activityRepository,
  stravaApiClient,
});

// Services.
const syncService = new SyncService({
  jobRepository,
  syncQueue,
});

// Controllers.
export const activitiesController = new ActivitiesController({
  activityRepository,
});

export const authController = new AuthController({
  stravaApiClient,
});

export const syncController = new SyncController({
  syncService,
});
