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

  findByAthleteId(athleteId) {
    return this.syncJobRepository.findByAthleteId(athleteId);
  }

  findById(syncJobId) {
    return this.syncJobRepository.findById(syncJobId);
  }
}
