export class JobRepository {
  constructor({ jobModel }) {
    this.jobModel = jobModel;
  }

  create(job) {
    return this.jobModel.create(job);
  }

  findById(id) {
    return this.jobModel.findById(id);
  }
}
