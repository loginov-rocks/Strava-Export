import { Router } from 'express';

import { activitiesController, authController, syncController } from './container.mjs';

export const router = Router();

router.get('/activities', activitiesController.getActivities);

router.get('/auth/client-credentials', authController.getClientCredentials);
router.post('/auth/exchange-code', authController.postExchangeCode);

router.post('/sync', syncController.post);
