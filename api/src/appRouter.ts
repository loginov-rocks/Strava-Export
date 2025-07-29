import { Router } from 'express';

import {
  activityController, compositeAuthMiddleware, healthcheckController, oauthController, patController,
  syncJobController, webAuthController, webAuthMiddleware,
} from './container';

export const appRouter = Router();

// Healthcheck.
appRouter.get('/', healthcheckController.get);

// Web Auth.
appRouter.get('/auth/login', webAuthController.getAuthLogin);
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
appRouter.post('/oauth/register', oauthController.postOAuthRegister);
appRouter.get('/oauth/authorize', webAuthMiddleware.optionalAccessToken, oauthController.getOAuthAuthorize);
appRouter.get('/oauth/callback', oauthController.getOAuthCallback);
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
