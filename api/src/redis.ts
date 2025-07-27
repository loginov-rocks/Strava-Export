import IORedis from 'ioredis';

import { REDIS_URL } from './constants';

interface Options {
  maxRetriesPerRequest?: number | null;
}

export const connectRedis = (options?: Options) => {
  return new IORedis(REDIS_URL, { maxRetriesPerRequest: options?.maxRetriesPerRequest });
};
