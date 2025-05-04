import { Router } from 'express';

import { activitiesController, authController, syncJobController } from './container.mjs';

export const router = Router();

router.get('/activities', activitiesController.getActivities);

router.get('/auth/client-credentials', authController.getClientCredentials);
router.post('/auth/exchange-code', authController.postExchangeCode);

router.post('/sync', syncJobController.postSyncJob);
router.get('/sync', syncJobController.getSyncJobs);
router.get('/sync/:jobId', syncJobController.getSyncJob);
