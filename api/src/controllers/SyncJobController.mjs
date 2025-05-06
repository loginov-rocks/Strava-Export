export class SyncJobController {
  constructor({ syncJobService }) {
    this.syncJobService = syncJobService;

    this.getSyncJob = this.getSyncJob.bind(this);
    this.getSyncJobs = this.getSyncJobs.bind(this);
    this.postSyncJob = this.postSyncJob.bind(this);
  }

  async getSyncJob(req, res) {
    const { syncJobId } = req.params;

    if (!syncJobId) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let syncJob;
    try {
      syncJob = await this.syncJobService.getSyncJob(syncJobId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(syncJob);
  }

  async getSyncJobs(req, res) {
    const { athleteId } = req.query;

    if (!athleteId) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let syncJobs;
    try {
      syncJobs = await this.syncJobService.getSyncJobsByAthleteId(athleteId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(syncJobs);
  }

  async postSyncJob(req, res) {
    const { athleteId } = req;

    if (!athleteId) {
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    let syncJob;
    try {
      syncJob = await this.syncJobService.createSyncJob({ athleteId });
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(syncJob);
  }
}
