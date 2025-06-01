import { SyncJobDocument } from '../models/syncJobModel';

interface SyncJobDto {
  id: string;
  userId: string;
  status: 'created' | 'started' | 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
}

export class SyncJobDtoFactory {
  createJson(syncJob: SyncJobDocument): SyncJobDto {
    return {
      id: syncJob._id.toString(),
      userId: syncJob.userId,
      status: syncJob.status,
      startedAt: syncJob.startedAt ? syncJob.startedAt.toISOString() : null,
      completedAt: syncJob.completedAt ? syncJob.completedAt.toISOString() : null,
      failedAt: syncJob.failedAt ? syncJob.failedAt.toISOString() : null,
    };
  }

  createJsonCollection(syncJobs: SyncJobDocument[]): SyncJobDto[] {
    return syncJobs.map((syncJob) => this.createJson(syncJob));
  }
}
