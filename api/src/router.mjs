import { Router } from 'express';

import { activitiesController, authController, stravaController } from './controllers.mjs';

export const router = Router();

router.get('/activities', activitiesController.getActivities);

router.get('/auth/client-credentials', authController.getClientCredentials);
router.post('/auth/exchange-code', authController.postExchangeCode);

router.get('/strava/process-activities', stravaController.getProcessActivities);
router.post('/strava/sync', stravaController.postSync);
