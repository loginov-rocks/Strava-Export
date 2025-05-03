export class StravaSyncJobRepository {
  constructor({ stravaSyncJobModel }) {
    this.stravaSyncJobModel = stravaSyncJobModel;
  }

  create(stravaSyncJob) {
    return this.stravaSyncJobModel.create(stravaSyncJob);
  }
}
