import { Router } from 'express';

import { activitiesController, authController, syncJobController, tokenMiddleware } from './container.mjs';

export const router = Router();

router.get('/activities', tokenMiddleware.require, activitiesController.getActivities);

router.get('/auth', tokenMiddleware.require, authController.get);
router.get('/auth/strava', authController.getStrava);
router.post('/auth/token',
  authController.postTokenMiddleware,
  tokenMiddleware.attach,
  authController.postToken,
);
router.post('/auth/logout',
  tokenMiddleware.require,
  tokenMiddleware.remove,
  authController.postLogout,
);

router.post('/sync', tokenMiddleware.require, syncJobController.postSyncJob);
router.get('/sync', tokenMiddleware.require, syncJobController.getSyncJobs);
router.get('/sync/:syncJobId', tokenMiddleware.require, syncJobController.getSyncJob);
