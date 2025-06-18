import { MONGOOSE_CONNECT_URI } from './constants';
import { syncJobWorker } from './container';
import { connect as connectDatabase } from './database';

connectDatabase(MONGOOSE_CONNECT_URI)
  .then(() => {
    syncJobWorker.run();
    console.log('Workers started');
  });
