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

    await this.syncJobQueue.add('sync', { syncJobId: syncJob.id });

    return { id: syncJob.id };
  }

  getSyncJob(syncJobId) {
    return this.syncJobRepository.findById(syncJobId);
  }

  getSyncJobsByAthleteId(athleteId) {
    return this.syncJobRepository.findByAthleteId(athleteId);
  }

  markSyncJobStarted(syncJobId) {
    console.log(`Sync job ${syncJobId} started`);
  }

  markSyncJobCompleted(syncJobId, returnValue) {
    console.log(`Sync job ${syncJobId} completed`, returnValue);
  }

  markSyncJobFailed(syncJobId, error) {
    console.log(`Sync job ${syncJobId} failed`, error);
  }
}
