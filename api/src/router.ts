import { Router } from 'express';

import {
  activityController, authController, compositeAuthMiddleware, patController, syncJobController, tokenMiddleware,
} from './container';

export const router = Router();

router.get('/.well-known/oauth-authorization-server', authController.getServerMetadata);
router.post('/oauth/register', authController.postOAuthRegister);
router.get('/oauth/authorize', authController.getOAuthAuthorize);
router.get('/oauth/redirect', authController.getOAuthRedirect);
router.post('/oauth/token', authController.postOAuthToken);

router.get('/auth', tokenMiddleware.requireAccessToken, authController.getAuth);
router.get('/auth/strava', authController.getAuthStrava);
router.post('/auth/token',
  authController.postAuthTokenMiddleware,
  tokenMiddleware.attachTokens,
  authController.postAuthToken,
);
router.post('/auth/refresh',
  tokenMiddleware.requireRefreshToken,
  authController.postAuthRefreshMiddleware,
  tokenMiddleware.attachTokens,
  authController.postAuthRefresh,
);
router.post('/auth/logout',
  tokenMiddleware.requireAccessToken,
  tokenMiddleware.removeTokens,
  authController.postAuthLogout,
);

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
