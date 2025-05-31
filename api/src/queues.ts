import { Queue } from 'bullmq';

import { SYNC_JOB_QUEUE_NAME } from './constants';

export const syncJobQueue = new Queue(SYNC_JOB_QUEUE_NAME);
