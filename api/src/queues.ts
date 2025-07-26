import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { REDIS_URL, SYNC_JOB_QUEUE_NAME } from './constants';

// TODO: Extract configuration.
export const syncJobQueue = new Queue(SYNC_JOB_QUEUE_NAME, { connection: new IORedis(REDIS_URL) });
