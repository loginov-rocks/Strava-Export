import { Router } from 'express';

import {
  activityController, compositeAuthMiddleware, healthcheckController, oauthController, patController,
  syncJobController, tokenMiddleware, webAuthController,
} from './container';

export const appRouter = Router();

// Healthcheck.
appRouter.get('/', healthcheckController.get);

// Web Auth.
appRouter.get('/auth/login', webAuthController.getAuthLogin);
appRouter.get('/auth/callback',
  webAuthController.getAuthCallbackMiddleware,
  tokenMiddleware.attachTokens,
  webAuthController.getAuthCallback,
);
appRouter.get('/auth/me', tokenMiddleware.requireAccessToken, webAuthController.getAuthMe);
appRouter.post('/auth/refresh',
  tokenMiddleware.requireRefreshToken,
  webAuthController.postAuthRefreshMiddleware,
  tokenMiddleware.attachTokens,
  webAuthController.postAuthRefresh,
);
appRouter.post('/auth/logout',
  tokenMiddleware.requireAccessToken,
  tokenMiddleware.removeTokens,
  webAuthController.postAuthLogout,
);

// OAuth.
appRouter.get('/.well-known/oauth-authorization-server', oauthController.getServerMetadata);
appRouter.post('/oauth/register', oauthController.postOAuthRegister);
appRouter.get('/oauth/authorize', tokenMiddleware.optionalAccessToken, oauthController.getOAuthAuthorize);
appRouter.get('/oauth/callback', oauthController.getOAuthCallback);
appRouter.post('/oauth/token', oauthController.postOAuthToken);

// Activities.
appRouter.get('/activities', compositeAuthMiddleware.requireAccessTokenOrPat, activityController.getActivities);
// Allow deleting all activities only through the Web Auth, not using PAT.
appRouter.delete('/activities', tokenMiddleware.requireAccessToken, activityController.deleteActivities);
appRouter.get('/activities/last', compositeAuthMiddleware.requireAccessTokenOrPat, activityController.getLastActivity);
appRouter.get('/activities/:activityId', compositeAuthMiddleware.requireAccessTokenOrPat, activityController.getActivity);

// Personal Access Tokens.
appRouter.post('/pats', tokenMiddleware.requireAccessToken, patController.postPat);
appRouter.get('/pats', tokenMiddleware.requireAccessToken, patController.getPats);
appRouter.get('/pats/:patId', tokenMiddleware.requireAccessToken, patController.getPat);
appRouter.delete('/pats/:patId', tokenMiddleware.requireAccessToken, patController.deletePat);

// Sync Jobs.
appRouter.post('/sync', tokenMiddleware.requireAccessToken, syncJobController.postSyncJob);
appRouter.get('/sync', tokenMiddleware.requireAccessToken, syncJobController.getSyncJobs);
appRouter.get('/sync/:syncJobId', tokenMiddleware.requireAccessToken, syncJobController.getSyncJob);
