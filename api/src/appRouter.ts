import { Router } from 'express';

import {
  activityController, compositeAuthMiddleware, healthcheckController, oauthController, patController,
  stravaWebhookController, syncJobController, userActivitiesController, userController, webAuthController,
  webAuthMiddleware,
} from './container';

export const appRouter = Router();

// Healthcheck.
appRouter.get('/', healthcheckController.get);

// Web Auth.
appRouter.get('/auth/login', webAuthController.getAuthLogin);
webAuthController.setCallbackRoute('/auth/callback');
appRouter.get('/auth/callback',
  webAuthController.getAuthCallbackMiddleware,
  webAuthMiddleware.attachTokens,
  webAuthController.getAuthCallback,
);
appRouter.get('/auth/me', webAuthMiddleware.requireAccessToken, webAuthController.getAuthMe);
appRouter.post('/auth/refresh',
  webAuthMiddleware.requireRefreshToken,
  webAuthController.postAuthRefreshMiddleware,
  webAuthMiddleware.attachTokens,
  webAuthController.postAuthRefresh,
);
appRouter.post('/auth/logout',
  webAuthMiddleware.requireAccessToken,
  webAuthMiddleware.removeTokens,
  webAuthController.postAuthLogout,
);

// OAuth.
appRouter.get('/.well-known/oauth-authorization-server', oauthController.getServerMetadata);
oauthController.setRegisterRoute('/oauth/register');
appRouter.post('/oauth/register', oauthController.postOAuthRegister);
oauthController.setAuthorizeRoute('/oauth/authorize');
appRouter.get('/oauth/authorize', webAuthMiddleware.optionalAccessToken, oauthController.getOAuthAuthorize);
oauthController.setCallbackRoute('/oauth/callback');
appRouter.get('/oauth/callback', oauthController.getOAuthCallback);
oauthController.setTokenRoute('/oauth/token');
appRouter.post('/oauth/token', oauthController.postOAuthToken);

// Activities.
appRouter.get('/activities', compositeAuthMiddleware.requireWebAuthOrPat, activityController.getActivities);
// Allow deleting all activities only through the Web Auth, not using PAT.
appRouter.delete('/activities', webAuthMiddleware.requireAccessToken, activityController.deleteActivities);
appRouter.get('/activities/last', compositeAuthMiddleware.requireWebAuthOrPat, activityController.getLastActivity);
appRouter.get('/activities/:activityId', compositeAuthMiddleware.requireWebAuthOrPat, activityController.getActivity);

// Personal Access Tokens.
appRouter.post('/pats', webAuthMiddleware.requireAccessToken, patController.postPat);
appRouter.get('/pats', webAuthMiddleware.requireAccessToken, patController.getPats);
appRouter.get('/pats/:patId', webAuthMiddleware.requireAccessToken, patController.getPat);
appRouter.delete('/pats/:patId', webAuthMiddleware.requireAccessToken, patController.deletePat);

// Sync Jobs.
appRouter.post('/sync', webAuthMiddleware.requireAccessToken, syncJobController.postSyncJob);
appRouter.get('/sync', webAuthMiddleware.requireAccessToken, syncJobController.getSyncJobs);
appRouter.get('/sync/:syncJobId', webAuthMiddleware.requireAccessToken, syncJobController.getSyncJob);

// Users.
appRouter.get('/users/me', webAuthMiddleware.requireAccessToken, userController.getUsersMe);
appRouter.patch('/users/me', webAuthMiddleware.requireAccessToken, userController.patchUsersMe);
appRouter.get('/users/:stravaAthleteId', webAuthMiddleware.optionalAccessToken, userController.getUser);

// Users Activities.
appRouter.get('/users/:stravaAthleteId/activities', webAuthMiddleware.optionalAccessToken,
  userActivitiesController.getUserActivities);

// Strava Webhook.
appRouter.get('/strava-webhook', stravaWebhookController.get);
appRouter.post('/strava-webhook', stravaWebhookController.post);
