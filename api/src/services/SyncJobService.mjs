export class SyncJobService {
  constructor({ syncJobQueue, syncJobRepository, userRepository }) {
    this.syncJobQueue = syncJobQueue;
    this.syncJobRepository = syncJobRepository;
    this.userRepository = userRepository;
  }

  async createSyncJob(userId) {
    const syncJob = await this.syncJobRepository.create({
      userId,
    });

    await this.syncJobQueue.add('syncJob', { syncJobId: syncJob.id, userId });

    return syncJob;
  }

  getSyncJob(syncJobId) {
    return this.syncJobRepository.findById(syncJobId);
  }

  getSyncJobsByUserId(userId) {
    return this.syncJobRepository.findByUserId(userId);
  }

  markSyncJobStarted(syncJobId) {
    return this.syncJobRepository.updateOneById(syncJobId, {
      status: 'started',
      startedAt: new Date(),
    });
  }

  markSyncJobCompleted(syncJobId, result) {
    return this.syncJobRepository.updateOneById(syncJobId, {
      status: 'completed',
      completedAt: new Date(),
      completedResult: result,
    });
  }

  markSyncJobFailed(syncJobId, error) {
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
