import { SyncJobModel } from '../models/syncJobModel';

interface Options {
  syncJobModel: SyncJobModel;
}

export class SyncJobRepository {
  private readonly syncJobModel: SyncJobModel;

  constructor({ syncJobModel }: Options) {
    this.syncJobModel = syncJobModel;
  }

  public create(syncJob: SyncJobModel) {
    return this.syncJobModel.create(syncJob);
  }

  public findById(id: string) {
    return this.syncJobModel.findById(id).lean();
  }

  public findByUserId(userId: string) {
    return this.syncJobModel.find({ userId }).lean();
  }

  public updateOneById(id: string, syncJob: SyncJobModel) {
    return this.syncJobModel.updateOne({ _id: id }, syncJob);
  }
}
