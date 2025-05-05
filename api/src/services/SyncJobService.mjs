export class SyncJobService {
  constructor({ syncJobQueue, syncJobRepository }) {
    this.syncJobQueue = syncJobQueue;
    this.syncJobRepository = syncJobRepository;
  }

  async createSyncJob({ athleteId, accessToken }) {
    const syncJob = await this.syncJobRepository.create({
      athleteId,
      accessToken,
    });

    await this.syncJobQueue.add('syncJob', { syncJobId: syncJob.id });

    return syncJob;
  }

  getSyncJob(syncJobId) {
    return this.syncJobRepository.findById(syncJobId);
  }

  getSyncJobsByAthleteId(athleteId) {
    return this.syncJobRepository.findByAthleteId(athleteId);
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
