import { Queue } from 'bullmq';

import { SYNC_JOB_QUEUE_NAME } from './constants';
import { connectRedis } from './redis';

export const syncJobQueue = new Queue(SYNC_JOB_QUEUE_NAME, {
  connection: connectRedis(),
});
