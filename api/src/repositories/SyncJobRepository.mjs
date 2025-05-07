export class SyncJobRepository {
  constructor({ syncJobModel }) {
    this.syncJobModel = syncJobModel;
  }

  create(syncJob) {
    return this.syncJobModel.create(syncJob);
  }

  findById(id) {
    return this.syncJobModel.findById(id).lean();
  }

  findByUserId(userId) {
    return this.syncJobModel.find({ userId }).lean();
  }

  updateOneById(id, syncJob) {
    return this.syncJobModel.updateOne({ _id: id }, syncJob);
  }
}
