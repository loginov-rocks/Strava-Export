import { Worker } from 'bullmq';
import IORedis from 'ioredis';

import { ActivitySyncService } from '../services/ActivitySyncService';
import { SyncJobService } from '../services/SyncJobService';

interface Options {
  activitySyncService: ActivitySyncService;
  syncJobQueueName: string;
  syncJobService: SyncJobService;
}

export class SyncJobWorker {
  private readonly activitySyncService: ActivitySyncService;
  private readonly syncJobQueueName: string;
  private readonly syncJobService: SyncJobService;

  private worker: Worker | null = null;

  constructor({ activitySyncService, syncJobQueueName, syncJobService }: Options) {
    this.activitySyncService = activitySyncService;
    this.syncJobQueueName = syncJobQueueName;
    this.syncJobService = syncJobService;
  }

  public init(connection: IORedis) {
    this.worker = new Worker(
      this.syncJobQueueName,
      async (job) => {
        const { syncJobId, userId, params } = job.data;

        console.log(`SyncJobWorker #${job.id} for ID "${syncJobId}" with user ID "${userId}" started`);

        await this.syncJobService.markSyncJobStarted(syncJobId);

        return this.activitySyncService.processPaginatedActivities(userId, params);
      },
      {
        autorun: false,
        connection,
      }
    );

    this.worker.on('completed', async (job, returnValue) => {
      const { syncJobId, userId } = job.data;

      console.log(`SyncJobWorker #${job.id} for ID "${syncJobId}" with user ID "${userId}" completed`, returnValue);

      // Await ensures the status update is complete before the handler exits.
      await this.syncJobService.markSyncJobCompleted(syncJobId, returnValue);
    });

    this.worker.on('failed', async (job, error) => {
      if (!job) {
        throw new Error('Unknown job failed');
      }

      const { syncJobId, userId } = job.data;

      console.log(`SyncJobWorker #${job.id} for ID "${syncJobId}" with user ID "${userId}" failed`, error);

      // Await ensures the status update is complete before the handler exits.
      await this.syncJobService.markSyncJobFailed(syncJobId, error);
    });
  }

  public run() {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    return this.worker.run();
  }
}
