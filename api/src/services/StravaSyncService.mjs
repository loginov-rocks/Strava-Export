import { StravaSyncJob } from '../models/StravaSyncJob.mjs';

export class StravaSyncService {
  async createJob({ athleteId, accessToken }) {
    const job = await StravaSyncJob.create({
      athleteId,
      accessToken,
    });

    return {
      athleteId: job.athleteId,
      id: job.id,
    };
  }
}
