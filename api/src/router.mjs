import { Router } from 'express';

import { activitiesController, authController, syncJobController, tokenMiddleware } from './container.mjs';

export const router = Router();

router.get('/activities', tokenMiddleware.requireAccessToken, activitiesController.getActivities);

router.get('/auth', tokenMiddleware.requireAccessToken, authController.get);
router.get('/auth/strava', authController.getStrava);
router.post('/auth/token',
  authController.postTokenMiddleware,
  tokenMiddleware.attach,
  authController.postToken,
);
router.post('/auth/refresh',
  tokenMiddleware.requireRefreshToken,
  authController.postRefreshMiddleware,
  tokenMiddleware.attach,
  authController.postRefresh);
router.post('/auth/logout',
  tokenMiddleware.requireAccessToken,
  tokenMiddleware.remove,
  authController.postLogout,
);

router.post('/sync', tokenMiddleware.requireAccessToken, syncJobController.postSyncJob);
router.get('/sync', tokenMiddleware.requireAccessToken, syncJobController.getSyncJobs);
router.get('/sync/:syncJobId', tokenMiddleware.requireAccessToken, syncJobController.getSyncJob);
