import { SyncJobData, SyncJobDocument, SyncJobModel } from '../models/syncJobModel';

import { BaseRepository } from './BaseRepository';

interface Options {
  syncJobModel: SyncJobModel;
}

export class SyncJobRepository extends BaseRepository<SyncJobData, SyncJobDocument> {
  constructor({ syncJobModel }: Options) {
    super({ model: syncJobModel });
  }

  public findByUserId(userId: string) {
    return this.model.find({ userId }).sort({ 'createdAt': -1 });
  }
}
