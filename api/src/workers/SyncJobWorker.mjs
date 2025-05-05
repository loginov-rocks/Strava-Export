import { Worker } from 'bullmq';

export class SyncJobWorker {
  constructor({ syncJobProcessor, syncJobQueueName, syncJobService }) {
    this.syncJobProcessor = syncJobProcessor;
    this.syncJobQueueName = syncJobQueueName;
    this.syncJobService = syncJobService;

    this.initWorker();
  }

  initWorker() {
    this.worker = new Worker(
      this.syncJobQueueName,
      async (job) => {
        const { syncJobId } = job.data;

        this.syncJobService.markSyncJobStarted(syncJobId);

        const syncJob = await this.syncJobService.getSyncJob(syncJobId);

        return this.syncJobProcessor.processPaginatedActivities(syncJob.accessToken);
      },
      {
        autorun: false,
        connection: { /* Using an empty object to prevent "Error: Worker requires a connection". */ },
      }
    );

    this.worker.on('completed', (job, returnValue) => {
      const { syncJobId } = job.data;

      this.syncJobService.markSyncJobCompleted(syncJobId, returnValue);
    });

    this.worker.on('failed', (job, error) => {
      const { syncJobId } = job.data;

      this.syncJobService.markSyncJobFailed(syncJobId, error);
    });
  }

  run() {
    return this.worker.run();
  }
}
