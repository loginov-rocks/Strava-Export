export const PORT = parseInt(process.env.PORT || '', 10);
export const MONGO_URL = process.env.MONGO_URL || '';
export const REDIS_URL = process.env.REDIS_URL || '';
export const API_URL = process.env.API_URL || '';
export const WEB_APP_URL = process.env.WEB_APP_URL || '';

export const USER_REPOSITORY_ENCRYPTION_IV = process.env.USER_REPOSITORY_ENCRYPTION_IV || '';
export const USER_REPOSITORY_ENCRYPTION_KEY = process.env.USER_REPOSITORY_ENCRYPTION_KEY || '';

export const ACCESS_TOKEN_COOKIE_NAME = 'stravaholicsAccessToken';
export const ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // seconds (15 minutes)
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
export const REFRESH_TOKEN_COOKIE_NAME = 'stravaholicsRefreshToken';
export const REFRESH_TOKEN_EXPIRES_IN = 30 * 24 * 60 * 60; // seconds (30 days)
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || '';

export const OAUTH_ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // seconds (15 minutes)
export const OAUTH_ACCESS_TOKEN_SECRET = process.env.OAUTH_ACCESS_TOKEN_SECRET || '';
export const OAUTH_REFRESH_TOKEN_EXPIRES_IN = 30 * 24 * 60 * 60; // seconds (30 days)
export const OAUTH_REFRESH_TOKEN_SECRET = process.env.OAUTH_REFRESH_TOKEN_SECRET || '';

export const STRAVA_API_BASE_URL = process.env.STRAVA_API_BASE_URL || '';
export const STRAVA_API_CLIENT_ID = process.env.STRAVA_API_CLIENT_ID || '';
export const STRAVA_API_CLIENT_SECRET = process.env.STRAVA_API_CLIENT_SECRET || '';

export const SYNC_JOB_QUEUE_NAME = 'SyncJob';

export const PAT_REPOSITORY_DISPLAY_LENGTH = 8;
export const PAT_REPOSITORY_TOKEN_PREFIX = 'pat_';
export const PAT_REPOSITORY_TOKEN_RANDOM_LENGTH = 32;
