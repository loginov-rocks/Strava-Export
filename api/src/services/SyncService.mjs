export class SyncService {
  constructor({ jobRepository, syncQueue }) {
    this.jobRepository = jobRepository;
    this.syncQueue = syncQueue;
  }

  async createJob({ athleteId, accessToken }) {
    const job = await this.jobRepository.create({
      athleteId,
      accessToken,
    });

    await this.syncQueue.add('sync', { jobId: job.id });

    return { id: job.id };
  }
}
