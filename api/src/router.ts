import { Router } from 'express';

import { activityController, authController, patController, syncJobController, tokenMiddleware } from './container';

export const router = Router();

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

router.get('/activities', tokenMiddleware.requireAccessToken, activityController.getActivities);
router.get('/activities/last', tokenMiddleware.requireAccessToken, activityController.getLastActivity);
router.get('/activities/:activityId', tokenMiddleware.requireAccessToken, activityController.getActivity);

router.post('/pats', tokenMiddleware.requireAccessToken, patController.postPat);
router.get('/pats', tokenMiddleware.requireAccessToken, patController.getPats);
router.get('/pats/:patId', tokenMiddleware.requireAccessToken, patController.getPat);
router.delete('/pats/:patId', tokenMiddleware.requireAccessToken, patController.deletePat);

router.post('/sync', tokenMiddleware.requireAccessToken, syncJobController.postSyncJob);
router.get('/sync', tokenMiddleware.requireAccessToken, syncJobController.getSyncJobs);
router.get('/sync/:syncJobId', tokenMiddleware.requireAccessToken, syncJobController.getSyncJob);
