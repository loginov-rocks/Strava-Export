import { Router } from 'express';

import { activitiesController, stravaAuthController, syncJobController } from './container.mjs';

export const router = Router();

router.get('/activities', activitiesController.getActivities);

router.get('/strava/auth/client-credentials', stravaAuthController.getClientCredentials);
router.post('/strava/auth/exchange-code', stravaAuthController.postExchangeCode);

router.post('/sync', syncJobController.postSyncJob);
router.get('/sync', syncJobController.getSyncJobs);
router.get('/sync/:jobId', syncJobController.getSyncJob);
