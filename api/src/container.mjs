import {
  JWT_SECRET, STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET, STRAVA_AUTH_COOKIE_NAME,
  SYNC_JOB_QUEUE_NAME,
} from './constants.mjs';

import { StravaApiClient } from './apiClients/StravaApiClient.mjs';

import { ActivitiesController } from './controllers/ActivitiesController.mjs';
import { StravaAuthController } from './controllers/StravaAuthController.mjs';
import { SyncJobController } from './controllers/SyncJobController.mjs';

import { activityModel } from './models/activityModel.mjs';
import { syncJobModel } from './models/syncJobModel.mjs';
import { userModel } from './models/userModel.mjs';

import { SyncJobProcessor } from './processors/SyncJobProcessor.mjs';

import { ActivityRepository } from './repositories/ActivityRepository.mjs';
import { SyncJobRepository } from './repositories/SyncJobRepository.mjs';
import { UserRepository } from './repositories/UserRepository.mjs';

import { ActivityService } from './services/ActivityService.mjs';
import { StravaAuthService } from './services/StravaAuthService.mjs';
import { SyncJobService } from './services/SyncJobService.mjs';

import { SyncJobWorker } from './workers/SyncJobWorker.mjs';

import { syncJobQueue } from './queues.mjs';

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

const userRepository = new UserRepository({
  userModel,
});

// Processors.
const syncJobProcessor = new SyncJobProcessor({
  activityRepository,
  stravaApiClient,
});

// Services.
const activityService = new ActivityService({
  activityRepository,
});

const stravaAuthService = new StravaAuthService({
  jwtSecret: JWT_SECRET,
  stravaApiClient,
  userRepository,
});

const syncJobService = new SyncJobService({
  syncJobQueue,
  syncJobRepository,
});

// Controllers.
export const activitiesController = new ActivitiesController({
  activityService,
});

export const stravaAuthController = new StravaAuthController({
  stravaAuthCookieName: STRAVA_AUTH_COOKIE_NAME,
  stravaAuthService,
});

export const syncJobController = new SyncJobController({
  syncJobService,
});

// Workers.
export const syncJobWorker = new SyncJobWorker({
  syncJobProcessor,
  syncJobQueueName: SYNC_JOB_QUEUE_NAME,
  syncJobService,
});
