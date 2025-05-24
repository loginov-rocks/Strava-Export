import {
  ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET, STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID,
  STRAVA_API_CLIENT_SECRET, SYNC_JOB_QUEUE_NAME, USER_REPOSITORY_ENCRYPTION_IV, USER_REPOSITORY_ENCRYPTION_KEY,
  WEB_APP_URL,
} from './constants.mjs';

import { StravaApiClient } from './apiClients/StravaApiClient.mjs';

import { ActivitiesController } from './controllers/ActivitiesController.mjs';
import { AuthController } from './controllers/AuthController.mjs';
import { SyncJobController } from './controllers/SyncJobController.mjs';

import { TokenMiddleware } from './middlewares/TokenMiddleware.mjs';

import { activityModel } from './models/activityModel.mjs';
import { syncJobModel } from './models/syncJobModel.mjs';
import { userModel } from './models/userModel.mjs';

import { ActivityRepository } from './repositories/ActivityRepository.mjs';
import { SyncJobRepository } from './repositories/SyncJobRepository.mjs';
import { UserRepository } from './repositories/UserRepository.mjs';

import { ActivityService } from './services/ActivityService.mjs';
import { ActivitySyncService } from './services/ActivitySyncService.mjs';
import { AuthService } from './services/AuthService.mjs';
import { StravaTokenService } from './services/StravaTokenService.mjs';
import { SyncJobService } from './services/SyncJobService.mjs';
import { TokenService } from './services/TokenService.mjs';

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
  encryptionIv: USER_REPOSITORY_ENCRYPTION_IV,
  encryptionKey: USER_REPOSITORY_ENCRYPTION_KEY,
  userModel,
});

// Services.
const activityService = new ActivityService({
  activityRepository,
});

const tokenService = new TokenService({
  accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
  accessTokenSecret: ACCESS_TOKEN_SECRET,
});

const authService = new AuthService({
  stravaApiClient,
  tokenService,
  userRepository,
  webAppUrl: WEB_APP_URL,
});

const stravaTokenService = new StravaTokenService({
  stravaApiClient,
  userRepository,
});

const activitySyncService = new ActivitySyncService({
  activityRepository,
  stravaApiClient,
  stravaTokenService,
});

const syncJobService = new SyncJobService({
  syncJobQueue,
  syncJobRepository,
  userRepository,
});

// Middlewares.
export const tokenMiddleware = new TokenMiddleware({
  accessTokenCookieName: ACCESS_TOKEN_COOKIE_NAME,
  tokenService,
});

// Controllers.
export const activitiesController = new ActivitiesController({
  activityService,
});

export const authController = new AuthController({
  authService,
});

export const syncJobController = new SyncJobController({
  syncJobService,
});

// Workers.
export const syncJobWorker = new SyncJobWorker({
  activitySyncService,
  syncJobQueueName: SYNC_JOB_QUEUE_NAME,
  syncJobService,
});
