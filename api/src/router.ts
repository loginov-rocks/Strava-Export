import { Router } from 'express';

import {
  activityController, oauthController, compositeAuthMiddleware, patController, syncJobController, tokenMiddleware,
  webAuthController,
} from './container';

export const router = Router();

router.get('/auth/login', webAuthController.getAuthLogin);
router.get('/auth/callback',
  webAuthController.getAuthCallbackMiddleware,
  tokenMiddleware.attachTokens,
  webAuthController.getAuthCallback,
);
router.get('/auth/me', tokenMiddleware.requireAccessToken, webAuthController.getAuthMe);
router.post('/auth/refresh',
  tokenMiddleware.requireRefreshToken,
  webAuthController.postAuthRefreshMiddleware,
  tokenMiddleware.attachTokens,
  webAuthController.postAuthRefresh,
);
router.post('/auth/logout',
  tokenMiddleware.requireAccessToken,
  tokenMiddleware.removeTokens,
  webAuthController.postAuthLogout,
);

router.get('/.well-known/oauth-authorization-server', oauthController.getServerMetadata);
router.post('/oauth/register', oauthController.postOAuthRegister);
router.get('/oauth/authorize', oauthController.getOAuthAuthorize);
router.get('/oauth/callback', oauthController.getOAuthCallback);
router.post('/oauth/token', oauthController.postOAuthToken);

router.get('/activities', compositeAuthMiddleware.requireAccessTokenOrPat, activityController.getActivities);
router.delete('/activities', compositeAuthMiddleware.requireAccessTokenOrPat, activityController.deleteActivities);
router.get('/activities/last', compositeAuthMiddleware.requireAccessTokenOrPat, activityController.getLastActivity);
router.get('/activities/:activityId', compositeAuthMiddleware.requireAccessTokenOrPat, activityController.getActivity);

router.post('/pats', tokenMiddleware.requireAccessToken, patController.postPat);
router.get('/pats', tokenMiddleware.requireAccessToken, patController.getPats);
router.get('/pats/:patId', tokenMiddleware.requireAccessToken, patController.getPat);
router.delete('/pats/:patId', tokenMiddleware.requireAccessToken, patController.deletePat);

router.post('/sync', tokenMiddleware.requireAccessToken, syncJobController.postSyncJob);
router.get('/sync', tokenMiddleware.requireAccessToken, syncJobController.getSyncJobs);
router.get('/sync/:syncJobId', tokenMiddleware.requireAccessToken, syncJobController.getSyncJob);
