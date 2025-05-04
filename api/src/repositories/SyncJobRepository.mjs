export class SyncJobRepository {
  constructor({ syncJobModel }) {
    this.syncJobModel = syncJobModel;
  }

  create(syncJob) {
    return this.syncJobModel.create(syncJob);
  }

  findByAthleteId(athleteId) {
    return this.syncJobModel.find({ athleteId });
  }

  findById(id) {
    return this.syncJobModel.findById(id);
  }
}
