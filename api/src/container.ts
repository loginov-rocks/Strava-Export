import {
  ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET, API_URL, OAUTH_ACCESS_TOKEN_EXPIRES_IN,
  OAUTH_ACCESS_TOKEN_SECRET, OAUTH_REFRESH_TOKEN_EXPIRES_IN, OAUTH_REFRESH_TOKEN_SECRET, PAT_REPOSITORY_DISPLAY_LENGTH,
  PAT_REPOSITORY_TOKEN_PREFIX, PAT_REPOSITORY_TOKEN_RANDOM_LENGTH, REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET, STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET, SYNC_JOB_QUEUE_NAME,
  USER_REPOSITORY_ENCRYPTION_IV, USER_REPOSITORY_ENCRYPTION_KEY, WEB_APP_URL,
} from './constants';

// API Clients.
import { StravaApiClient } from './apiClients/StravaApiClient';

// Controllers.
import { ActivityController } from './controllers/ActivitiesController';
import { McpSseController } from './controllers/McpSseController';
import { McpStreamableController } from './controllers/McpStreamableController';
import { OAuthController } from './controllers/OAuthController';
import { PatController } from './controllers/PatController';
import { SyncJobController } from './controllers/SyncJobController';
import { WebAuthController } from './controllers/WebAuthController';

// DTO Factories.
import { ActivityDtoFactory } from './dtoFactories/ActivityDtoFactory';
import { PatDtoFactory } from './dtoFactories/PatDtoFactory';
import { SyncJobDtoFactory } from './dtoFactories/SyncJobDtoFactory';

// MCP.
import { McpServer } from './mcp/McpServer';

// Middlewares.
import { CompositeAuthMiddleware } from './middlewares/CompositeAuthMiddleware';
import { McpAuthMiddleware } from './middlewares/McpAuthMiddleware';
import { PatMiddleware } from './middlewares/PatMiddleware';
import { TokenMiddleware } from './middlewares/TokenMiddleware';

// Models.
import { activityModel } from './models/activityModel';
import { oauthClientModel } from './models/oauthClientModel';
import { oauthCodeModel } from './models/oauthCodeModel';
import { oauthStateModel } from './models/oauthStateModel';
import { patModel } from './models/patModel';
import { syncJobModel } from './models/syncJobModel';
import { userModel } from './models/userModel';

// Repositories.
import { ActivityRepository } from './repositories/ActivityRepository';
import { OAuthClientRepository } from './repositories/OAuthClientRepository';
import { OAuthCodeRepository } from './repositories/OAuthCodeRepository';
import { OAuthStateRepository } from './repositories/OAuthStateRepository';
import { PatRepository } from './repositories/PatRepository';
import { SyncJobRepository } from './repositories/SyncJobRepository';
import { UserRepository } from './repositories/UserRepository';

// Services.
import { ActivityService } from './services/ActivityService';
import { ActivitySyncService } from './services/ActivitySyncService';
import { AuthService } from './services/AuthService';
import { OAuthService } from './services/OAuthService';
import { PatService } from './services/PatService';
import { StravaTokenService } from './services/StravaTokenService';
import { SyncJobService } from './services/SyncJobService';
import { TokenService } from './services/TokenService';

// Workers.
import { SyncJobWorker } from './workers/SyncJobWorker';

// Queues.
import { syncJobQueue } from './queues';

// API Clients.
const stravaApiClient = new StravaApiClient({
  baseUrl: STRAVA_API_BASE_URL,
  clientId: STRAVA_API_CLIENT_ID,
  clientSecret: STRAVA_API_CLIENT_SECRET,
});

// Repositories.
const activityRepository = new ActivityRepository({
  activityModel,
});

const oauthClientRepository = new OAuthClientRepository({
  oauthClientModel,
});

const oauthCodeRepository = new OAuthCodeRepository({
  oauthCodeModel,
});

const oauthStateRepository = new OAuthStateRepository({
  oauthStateModel,
});

const patRepository = new PatRepository({
  displayLength: PAT_REPOSITORY_DISPLAY_LENGTH,
  patModel,
  tokenPrefix: PAT_REPOSITORY_TOKEN_PREFIX,
  tokenRandomLength: PAT_REPOSITORY_TOKEN_RANDOM_LENGTH,
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

const oauthTokenService = new TokenService({
  accessTokenExpiresIn: OAUTH_ACCESS_TOKEN_EXPIRES_IN,
  accessTokenSecret: OAUTH_ACCESS_TOKEN_SECRET,
  refreshTokenExpiresIn: OAUTH_REFRESH_TOKEN_EXPIRES_IN,
  refreshTokenSecret: OAUTH_REFRESH_TOKEN_SECRET,
});

const authService = new AuthService({
  apiUrl: API_URL,
  stravaApiClient,
  tokenService,
  userRepository,
});

const oauthService = new OAuthService({
  apiUrl: API_URL,
  oauthClientRepository,
  oauthCodeRepository,
  oauthStateRepository,
  stravaApiClient,
  tokenService: oauthTokenService,
  userRepository,
});

const activitySyncService = new ActivitySyncService({
  activityRepository,
  stravaApiClient,
  stravaTokenService,
});

// Middlewares.
export const mcpAuthMiddleware = new McpAuthMiddleware({
  tokenService: oauthTokenService,
});

const patMiddleware = new PatMiddleware({
  patService,
});

export const tokenMiddleware = new TokenMiddleware({
  accessTokenCookieName: ACCESS_TOKEN_COOKIE_NAME,
  refreshTokenCookieName: REFRESH_TOKEN_COOKIE_NAME,
  tokenService,
});

export const compositeAuthMiddleware = new CompositeAuthMiddleware({
  patMiddleware,
  tokenMiddleware,
});

// DTO Factories.
const activityDtoFactory = new ActivityDtoFactory();

const patDtoFactory = new PatDtoFactory();

const syncJobDtoFactory = new SyncJobDtoFactory();

// MCP.
const mcpServer = new McpServer({
  activityDtoFactory,
  activityService,
});

// Controllers.
export const activityController = new ActivityController({
  activityDtoFactory,
  activityService,
});

export const mcpSseController = new McpSseController({
  mcpServer,
})

export const mcpStreamableController = new McpStreamableController({
  mcpServer,
});

export const oauthController = new OAuthController({
  apiUrl: API_URL,
  oauthService,
});

export const patController = new PatController({
  patDtoFactory,
  patService,
});

export const syncJobController = new SyncJobController({
  syncJobDtoFactory,
  syncJobService,
});

export const webAuthController = new WebAuthController({
  authService,
  webAppUrl: WEB_APP_URL,
});

// Workers.
export const syncJobWorker = new SyncJobWorker({
  activitySyncService,
  syncJobQueueName: SYNC_JOB_QUEUE_NAME,
  syncJobService,
});
