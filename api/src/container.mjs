import { STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET } from './constants.mjs';

import { StravaApiClient } from './apiClients/StravaApiClient.mjs';

import { ActivitiesController } from './controllers/ActivitiesController.mjs';
import { StravaAuthController } from './controllers/StravaAuthController.mjs';
import { SyncJobController } from './controllers/SyncJobController.mjs';

import { activityModel } from './models/activityModel.mjs';
import { syncJobModel } from './models/syncJobModel.mjs';

import { SyncJobProcessor } from './processors/SyncJobProcessor.mjs';

import { ActivityRepository } from './repositories/ActivityRepository.mjs';
import { SyncJobRepository } from './repositories/SyncJobRepository.mjs';

import { ActivityService } from './services/ActivityService.mjs';
import { StravaAuthService } from './services/StravaAuthService.mjs';
import { SyncJobService } from './services/SyncJobService.mjs';

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

const syncJobRepository = new SyncJobRepository({
  syncJobModel,
});

// Processors.
export const syncJobProcessor = new SyncJobProcessor({
  activityRepository,
  stravaApiClient,
});

// Services.
const activityService = new ActivityService({
  activityRepository,
});

const stravaAuthService = new StravaAuthService({
  stravaApiClient,
});

export const syncJobService = new SyncJobService({
  syncJobRepository,
  syncQueue,
});

// Controllers.
export const activitiesController = new ActivitiesController({
  activityService,
});

export const stravaAuthController = new StravaAuthController({
  stravaAuthService,
});

export const syncJobController = new SyncJobController({
  syncJobService,
});
