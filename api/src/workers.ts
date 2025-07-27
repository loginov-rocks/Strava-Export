import { syncJobWorker } from './container';
import { connectMongo } from './mongo';
import { connectRedis } from './redis';

connectMongo().then(() => {
  // Required by BullMQ: "Error: BullMQ: Your redis options maxRetriesPerRequest must be null."
  const redisConnection = connectRedis({ maxRetriesPerRequest: null });
  syncJobWorker.init(redisConnection);
  syncJobWorker.run();
  console.log('Workers started');
});
