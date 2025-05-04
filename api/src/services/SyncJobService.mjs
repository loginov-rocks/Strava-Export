export class SyncJobService {
  constructor({ syncJobRepository, syncQueue }) {
    this.syncJobRepository = syncJobRepository;
    this.syncQueue = syncQueue;
  }

  async createSyncJob({ athleteId, accessToken }) {
    const syncJob = await this.syncJobRepository.create({
      athleteId,
      accessToken,
    });

    await this.syncQueue.add('sync', { syncJobId: syncJob.id });

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

  markSyncJobCompleted(syncJobId, results) {
    console.log(`Sync job ${syncJobId} completed`, results);
  }

  markSyncJobFailed(syncJobId, error) {
    console.log(`Sync job ${syncJobId} failed`, error);
  }
}
