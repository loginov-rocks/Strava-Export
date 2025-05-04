import { Worker } from 'bullmq';
import 'dotenv/config';

import { MONGOOSE_CONNECT_URI } from './constants.mjs';
import { syncJobService, syncJobProcessor } from './container.mjs';
import { connect as connectDatabase } from './database.mjs';

connectDatabase(MONGOOSE_CONNECT_URI)
  .then(() => {
    new Worker('Sync', async (job) => {
      const { syncJobId } = job.data;

      const syncJob = await syncJobService.getSyncJob(syncJobId);

      console.log(syncJob);

      syncJobService.markSyncJobStarted(syncJobId);

      let results;
      try {
        results = await syncJobProcessor.processPaginatedActivities(syncJob.accessToken);
      } catch (error) {
        syncJobService.markSyncJobFailed(syncJobId, error);

        return;
      }

      syncJobService.markSyncJobCompleted(syncJobId, results);
    }, { connection: { /* Using an empty object to prevent "Error: Worker requires a connection". */ } });

    console.log('Sync worker started');
  });
