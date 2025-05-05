import 'dotenv/config';

import { MONGOOSE_CONNECT_URI } from './constants.mjs';
import { syncJobWorker } from './container.mjs';
import { connect as connectDatabase } from './database.mjs';

connectDatabase(MONGOOSE_CONNECT_URI)
  .then(() => {
    syncJobWorker.run();
    console.log('Workers started');
  });
