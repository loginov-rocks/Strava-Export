import { SyncJobModel, SyncJobSchema } from '../models/syncJobModel';

interface Options {
  syncJobModel: SyncJobModel;
}

export class SyncJobRepository {
  private readonly syncJobModel: SyncJobModel;

  constructor({ syncJobModel }: Options) {
    this.syncJobModel = syncJobModel;
  }

  public create(syncJob: SyncJobSchema) {
    return this.syncJobModel.create(syncJob);
  }

  public findById(id: string) {
    return this.syncJobModel.findById(id).lean();
  }

  public findByUserId(userId: string) {
    return this.syncJobModel.find({ userId }).sort({ 'createdAt': -1 }).lean();
  }

  public updateOneById(id: string, syncJobData: Partial<SyncJobSchema>) {
    return this.syncJobModel.updateOne({ _id: id }, syncJobData);
  }
}
