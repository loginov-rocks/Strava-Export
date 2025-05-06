import { Router } from 'express';

import { activitiesController, authMiddleware, stravaAuthController, syncJobController } from './container.mjs';

export const router = Router();

router.get('/activities', authMiddleware.middleware, activitiesController.getActivities);

router.get('/strava/auth/client-credentials', stravaAuthController.getClientCredentials);
router.post('/strava/auth/exchange-code', stravaAuthController.postExchangeCode);

router.post('/sync', authMiddleware.middleware, syncJobController.postSyncJob);
router.get('/sync', authMiddleware.middleware, syncJobController.getSyncJobs);
router.get('/sync/:syncJobId', authMiddleware.middleware, syncJobController.getSyncJob);
