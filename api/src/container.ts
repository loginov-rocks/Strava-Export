import {
  ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRES_IN, REFRESH_TOKEN_SECRET, STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET,
  SYNC_JOB_QUEUE_NAME, USER_REPOSITORY_ENCRYPTION_IV, USER_REPOSITORY_ENCRYPTION_KEY, WEB_APP_URL,
} from './constants';

import { StravaApiClient } from './apiClients/StravaApiClient';

import { ActivityController } from './controllers/ActivitiesController';
import { AuthController } from './controllers/AuthController';
import { PatController } from './controllers/PatController';
import { SyncJobController } from './controllers/SyncJobController';

import { ActivityDtoFactory } from './dtoFactories/ActivityDtoFactory';
import { PatDtoFactory } from './dtoFactories/PatDtoFactory';
import { SyncJobDtoFactory } from './dtoFactories/SyncJobDtoFactory';

import { TokenMiddleware } from './middlewares/TokenMiddleware';

import { activityModel } from './models/activityModel';
import { patModel } from './models/patModel';
import { syncJobModel } from './models/syncJobModel';
import { userModel } from './models/userModel';

import { ActivityRepository } from './repositories/ActivityRepository';
import { PatRepository } from './repositories/PatRepository';
import { SyncJobRepository } from './repositories/SyncJobRepository';
import { UserRepository } from './repositories/UserRepository';

import { ActivityService } from './services/ActivityService';
import { ActivitySyncService } from './services/ActivitySyncService';
import { AuthService } from './services/AuthService';
import { PatService } from './services/PatService';
import { StravaTokenService } from './services/StravaTokenService';
import { SyncJobService } from './services/SyncJobService';
import { TokenService } from './services/TokenService';

import { SyncJobWorker } from './workers/SyncJobWorker';

import { syncJobQueue } from './queues';

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

const patRepository = new PatRepository({
  patModel,
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

const patService = new PatService({
  patRepository,
});

const stravaTokenService = new StravaTokenService({
  stravaApiClient,
  userRepository,
});

const syncJobService = new SyncJobService({
  syncJobQueue,
  syncJobRepository,
});

const tokenService = new TokenService({
  accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
  accessTokenSecret: ACCESS_TOKEN_SECRET,
  refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
  refreshTokenSecret: REFRESH_TOKEN_SECRET,
});

const authService = new AuthService({
  stravaApiClient,
  tokenService,
  userRepository,
  webAppUrl: WEB_APP_URL,
});

const activitySyncService = new ActivitySyncService({
  activityRepository,
  stravaApiClient,
  stravaTokenService,
});

// Middlewares.
export const tokenMiddleware = new TokenMiddleware({
  accessTokenCookieName: ACCESS_TOKEN_COOKIE_NAME,
  refreshTokenCookieName: REFRESH_TOKEN_COOKIE_NAME,
  tokenService,
});

// DTO Factories.
const activityDtoFactory = new ActivityDtoFactory();

const patDtoFactory = new PatDtoFactory();

const syncJobDtoFactory = new SyncJobDtoFactory();

// Controllers.
export const activityController = new ActivityController({
  activityDtoFactory,
  activityService,
});

export const authController = new AuthController({
  authService,
});

export const patController = new PatController({
  patDtoFactory,
  patService,
});

export const syncJobController = new SyncJobController({
  syncJobDtoFactory,
  syncJobService,
});

// Workers.
export const syncJobWorker = new SyncJobWorker({
  activitySyncService,
  syncJobQueueName: SYNC_JOB_QUEUE_NAME,
  syncJobService,
});
