import { SyncJobDocument } from '../models/syncJobModel';

type SyncJobStatus = 'created' | 'started' | 'completed' | 'failed';

interface SyncJobDto {
  id: string;
  userId: string;
  status: SyncJobStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
}

interface SyncJobsCollectionDto {
  syncJobsCount: number;
  syncJobs: SyncJobDto[];
}

export class SyncJobDtoFactory {
  public createJson(syncJob: SyncJobDocument): SyncJobDto {
    return {
      id: syncJob.id,
      userId: syncJob.userId,
      status: syncJob.status,
      createdAt: syncJob.createdAt.toISOString(),
      startedAt: syncJob.startedAt ? syncJob.startedAt.toISOString() : null,
      completedAt: syncJob.completedAt ? syncJob.completedAt.toISOString() : null,
      failedAt: syncJob.failedAt ? syncJob.failedAt.toISOString() : null,
    };
  }

  public createJsonCollection(syncJobs: SyncJobDocument[]): SyncJobsCollectionDto {
    const syncJobDtos = syncJobs.map((syncJob) => this.createJson(syncJob));

    return {
      syncJobsCount: syncJobDtos.length,
      syncJobs: syncJobDtos,
    };
  }
}
