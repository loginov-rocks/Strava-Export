export const JWT_COOKIE_NAME = 'token';
export const JWT_EXPIRES_IN = 15 * 60; // seconds
export const JWT_SECRET = process.env.JWT_SECRET;

export const MONGOOSE_CONNECT_URI = process.env.MONGOOSE_CONNECT_URI;

export const PORT = process.env.PORT;

export const STRAVA_API_BASE_URL = process.env.STRAVA_API_BASE_URL;
export const STRAVA_API_CLIENT_ID = process.env.STRAVA_API_CLIENT_ID;
export const STRAVA_API_CLIENT_SECRET = process.env.STRAVA_API_CLIENT_SECRET;

export const SYNC_JOB_QUEUE_NAME = 'SyncJob';

export const USER_REPOSITORY_ENCRYPTION_IV = process.env.USER_REPOSITORY_ENCRYPTION_IV;
export const USER_REPOSITORY_ENCRYPTION_KEY = process.env.USER_REPOSITORY_ENCRYPTION_KEY;

export const WEB_APP_URL = process.env.WEB_APP_URL;
