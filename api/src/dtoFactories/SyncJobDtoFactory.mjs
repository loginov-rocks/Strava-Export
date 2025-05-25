export class SyncJobDtoFactory {
  createJson(syncJob) {
    return {
      id: syncJob._id.toString(),
      userId: syncJob.userId,
      status: syncJob.status,
      startedAt: syncJob.startedAt ? syncJob.startedAt : null,
      completedAt: syncJob.completedAt ? syncJob.completedAt : null,
      failedAt: syncJob.failedAt ? syncJob.failedAt : null,
    };
  }
}
