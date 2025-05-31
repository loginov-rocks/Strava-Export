import { Queue } from 'bullmq';

import { SyncJobRepository } from '../repositories/SyncJobRepository';
import { UserRepository } from '../repositories/UserRepository';

interface Options {
  syncJobQueue: Queue;
  syncJobRepository: SyncJobRepository;
}

export class SyncJobService {
  private readonly syncJobQueue: Queue;
  private readonly syncJobRepository: SyncJobRepository;

  constructor({ syncJobQueue, syncJobRepository }: Options) {
    this.syncJobQueue = syncJobQueue;
    this.syncJobRepository = syncJobRepository;
  }

  public async createSyncJob(userId: string) {
    const syncJob = await this.syncJobRepository.create({
      userId,
    });

    await this.syncJobQueue.add('syncJob', { syncJobId: syncJob.id, userId });

    return syncJob;
  }

  public getSyncJob(syncJobId: string) {
    return this.syncJobRepository.findById(syncJobId);
  }

  public getSyncJobsByUserId(userId: string) {
    return this.syncJobRepository.findByUserId(userId);
  }

  public markSyncJobStarted(syncJobId: string) {
    return this.syncJobRepository.updateOneById(syncJobId, {
      status: 'started',
      startedAt: new Date(),
    });
  }

  public markSyncJobCompleted(syncJobId: string, result) {
    return this.syncJobRepository.updateOneById(syncJobId, {
      status: 'completed',
      completedAt: new Date(),
      completedResult: result,
    });
  }

  public markSyncJobFailed(syncJobId: string, error) {
    return this.syncJobRepository.updateOneById(syncJobId, {
      status: 'failed',
      failedAt: new Date(),
      failedError: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
}
