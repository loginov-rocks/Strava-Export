import {
  API_BASE_URL, MCP_BASE_URL, OAUTH_ACCESS_TOKEN_EXPIRES_IN, OAUTH_ACCESS_TOKEN_SECRET, OAUTH_REFRESH_TOKEN_EXPIRES_IN,
  OAUTH_REFRESH_TOKEN_SECRET, PAT_REPOSITORY_DISPLAY_LENGTH, PAT_REPOSITORY_TOKEN_PREFIX,
  PAT_REPOSITORY_TOKEN_RANDOM_LENGTH, STRAVA_API_BASE_URL, STRAVA_API_CLIENT_ID, STRAVA_API_CLIENT_SECRET,
  STRAVA_WEBHOOK_VERIFY_TOKEN, SYNC_JOB_QUEUE_NAME, USER_REPOSITORY_ENCRYPTION_IV, USER_REPOSITORY_ENCRYPTION_KEY,
  WEB_APP_BASE_URL, WEB_AUTH_ACCESS_TOKEN_COOKIE_NAME, WEB_AUTH_ACCESS_TOKEN_EXPIRES_IN, WEB_AUTH_ACCESS_TOKEN_SECRET,
  WEB_AUTH_REFRESH_TOKEN_COOKIE_NAME, WEB_AUTH_REFRESH_TOKEN_EXPIRES_IN, WEB_AUTH_REFRESH_TOKEN_SECRET,
} from './constants';

// API Clients.
import { StravaApiClient } from './apiClients/StravaApiClient';

// Controllers.
import { ActivityController } from './controllers/ActivitiesController';
import { HealthcheckController } from './controllers/HealthcheckController';
import { McpSseController } from './controllers/McpSseController';
import { McpStreamableController } from './controllers/McpStreamableController';
import { OAuthController } from './controllers/OAuthController';
import { PatController } from './controllers/PatController';
import { StravaWebhookController } from './controllers/StravaWebhookController';
import { SyncJobController } from './controllers/SyncJobController';
import { UserActivitiesController } from './controllers/UserActivitiesController';
import { UserController } from './controllers/UserController';
import { WebAuthController } from './controllers/WebAuthController';

// DTO Factories.
import { ActivityDtoFactory } from './dtoFactories/ActivityDtoFactory';
import { PatDtoFactory } from './dtoFactories/PatDtoFactory';
import { SyncJobDtoFactory } from './dtoFactories/SyncJobDtoFactory';
import { UserActivitiesDtoFactory } from './dtoFactories/UserActivitiesDtoFactory';
import { UserDtoFactory } from './dtoFactories/UserDtoFactory';

// MCP.
import { McpServer } from './mcp/McpServer';

// Middlewares.
import { CompositeAuthMiddleware } from './middlewares/CompositeAuthMiddleware';
import { McpAuthMiddleware } from './middlewares/McpAuthMiddleware';
import { PatMiddleware } from './middlewares/PatMiddleware';
import { WebAuthMiddleware } from './middlewares/WebAuthMiddleware';

// Models.
import { activityModel } from './models/activityModel';
import { oAuthClientModel } from './models/oAuthClientModel';
import { oAuthCodeModel } from './models/oAuthCodeModel';
import { oAuthStateModel } from './models/oAuthStateModel';
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
import { OAuthService } from './services/OAuthService';
import { PatService } from './services/PatService';
import { StravaWebhookService } from './services/StravaWebhookService';
import { SyncJobService } from './services/SyncJobService';
import { TokenService } from './services/TokenService';
import { UserService } from './services/UserService';
import { WebAuthService } from './services/WebAuthService';

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
  oAuthClientModel,
});

const oauthCodeRepository = new OAuthCodeRepository({
  oAuthCodeModel,
});

const oauthStateRepository = new OAuthStateRepository({
  oAuthStateModel,
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

const userService = new UserService({
  stravaApiClient,
  userRepository,
});

const activitySyncService = new ActivitySyncService({
  activityRepository,
  stravaApiClient,
  userService,
});

const stravaWebhookService = new StravaWebhookService({
  activityRepository,
  stravaApiClient,
  userService,
});

const syncJobService = new SyncJobService({
  syncJobQueue,
  syncJobRepository,
});

const oauthTokenService = new TokenService({
  accessTokenExpiresIn: OAUTH_ACCESS_TOKEN_EXPIRES_IN,
  accessTokenSecret: OAUTH_ACCESS_TOKEN_SECRET,
  refreshTokenExpiresIn: OAUTH_REFRESH_TOKEN_EXPIRES_IN,
  refreshTokenSecret: OAUTH_REFRESH_TOKEN_SECRET,
});

const webAuthTokenService = new TokenService({
  accessTokenExpiresIn: WEB_AUTH_ACCESS_TOKEN_EXPIRES_IN,
  accessTokenSecret: WEB_AUTH_ACCESS_TOKEN_SECRET,
  refreshTokenExpiresIn: WEB_AUTH_REFRESH_TOKEN_EXPIRES_IN,
  refreshTokenSecret: WEB_AUTH_REFRESH_TOKEN_SECRET,
});

const oauthService = new OAuthService({
  oauthClientRepository,
  oauthCodeRepository,
  oauthStateRepository,
  stravaApiClient,
  tokenService: oauthTokenService,
  userService,
});

const webAuthService = new WebAuthService({
  stravaApiClient,
  tokenService: webAuthTokenService,
  userService,
});

// Middlewares.
export const mcpAuthMiddleware = new McpAuthMiddleware({
  mcpBaseUrl: MCP_BASE_URL,
  tokenService: oauthTokenService,
});

const patMiddleware = new PatMiddleware({
  patService,
});

export const webAuthMiddleware = new WebAuthMiddleware({
  accessTokenCookieName: WEB_AUTH_ACCESS_TOKEN_COOKIE_NAME,
  refreshTokenCookieName: WEB_AUTH_REFRESH_TOKEN_COOKIE_NAME,
  tokenService: webAuthTokenService,
});

export const compositeAuthMiddleware = new CompositeAuthMiddleware({
  patMiddleware,
  webAuthMiddleware,
});

// DTO Factories.
const activityDtoFactory = new ActivityDtoFactory();

const patDtoFactory = new PatDtoFactory();

const syncJobDtoFactory = new SyncJobDtoFactory();

const userActivitiesDtoFactory = new UserActivitiesDtoFactory();

const userDtoFactory = new UserDtoFactory();

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

export const healthcheckController = new HealthcheckController();

export const mcpSseController = new McpSseController({
  mcpServer,
})

export const mcpStreamableController = new McpStreamableController({
  mcpServer,
});

export const oauthController = new OAuthController({
  apiBaseUrl: API_BASE_URL,
  mcpBaseUrl: MCP_BASE_URL,
  oauthService,
});

export const patController = new PatController({
  patDtoFactory,
  patService,
});

export const stravaWebhookController = new StravaWebhookController({
  stravaWebhookService,
  verifyToken: STRAVA_WEBHOOK_VERIFY_TOKEN,
});

export const syncJobController = new SyncJobController({
  syncJobDtoFactory,
  syncJobService,
});

export const userActivitiesController = new UserActivitiesController({
  activityService,
  userActivitiesDtoFactory,
  userService,
});

export const userController = new UserController({
  userDtoFactory,
  userService,
});

export const webAuthController = new WebAuthController({
  apiBaseUrl: API_BASE_URL,
  webAppBaseUrl: WEB_APP_BASE_URL,
  webAuthService,
});

// Workers.
export const syncJobWorker = new SyncJobWorker({
  activitySyncService,
  syncJobQueueName: SYNC_JOB_QUEUE_NAME,
  syncJobService,
});
