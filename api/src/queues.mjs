import { Queue } from 'bullmq';

import { SYNC_JOB_QUEUE_NAME } from './constants.mjs';

export const syncJobQueue = new Queue(SYNC_JOB_QUEUE_NAME);
