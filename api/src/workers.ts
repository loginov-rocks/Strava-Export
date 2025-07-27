import { MONGO_URL } from './constants';
import { syncJobWorker } from './container';
import { connect as connectDatabase } from './database';

connectDatabase(MONGO_URL)
  .then(() => {
    syncJobWorker.run();
    console.log('Workers started');
  });
