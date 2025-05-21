import { Router } from 'express';

import { activitiesController, authController, jwtMiddleware, syncJobController } from './container.mjs';

export const router = Router();

router.get('/activities', jwtMiddleware.require, activitiesController.getActivities);

router.get('/auth', jwtMiddleware.require, authController.get);
router.get('/auth/strava', authController.getStrava);
router.post('/auth/token',
  authController.postTokenMiddleware,
  jwtMiddleware.attach,
  authController.postToken,
);
router.post('/auth/logout',
  jwtMiddleware.require,
  jwtMiddleware.remove,
  authController.postLogout,
);

router.post('/sync', jwtMiddleware.require, syncJobController.postSyncJob);
router.get('/sync', jwtMiddleware.require, syncJobController.getSyncJobs);
router.get('/sync/:syncJobId', jwtMiddleware.require, syncJobController.getSyncJob);
