import { Worker } from 'bullmq';
import 'dotenv/config';

import { MONGOOSE_CONNECT_URI } from './constants.mjs';
import { syncJobService, syncJobProcessor } from './container.mjs';
import { connect as connectDatabase } from './database.mjs';

connectDatabase(MONGOOSE_CONNECT_URI)
  .then(() => {
    new Worker('Sync', async (job) => {
      const { syncJobId } = job.data;

      const syncJob = await syncJobService.findById(syncJobId);

      console.log(syncJob);

      const results = await syncJobProcessor.processPaginatedActivities(syncJob.accessToken);

      console.log(results);
    }, { connection: { /* Using an empty object to prevent "Error: Worker requires a connection". */ } });

    console.log('Sync worker started');
  });
