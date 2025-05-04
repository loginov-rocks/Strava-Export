import { Worker } from 'bullmq';
import 'dotenv/config';

import { MONGOOSE_CONNECT_URI } from './constants.mjs';
import { jobRepository, syncProcessor } from './container.mjs';
import { connect as connectDatabase } from './database.mjs';

connectDatabase(MONGOOSE_CONNECT_URI)
  .then(() => {
    new Worker('Sync', async (job) => {
      const { jobId } = job.data;

      const jobData = await jobRepository.findById(jobId);

      console.log(jobData);

      const results = await syncProcessor.processPaginatedActivities(jobData.accessToken);

      console.log(results);
    }, { connection: { /* Using an empty object to prevent "Error: Worker requires a connection". */ } });

    console.log('Worker started');
  });
