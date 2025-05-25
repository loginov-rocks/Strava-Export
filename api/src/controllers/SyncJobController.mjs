export class SyncJobController {
  constructor({ syncJobDtoFactory, syncJobService }) {
    this.syncJobDtoFactory = syncJobDtoFactory;
    this.syncJobService = syncJobService;

    this.getSyncJob = this.getSyncJob.bind(this);
    this.getSyncJobs = this.getSyncJobs.bind(this);
    this.postSyncJob = this.postSyncJob.bind(this);
  }

  async getSyncJob(req, res) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

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

    if (!syncJob || syncJob.userId !== userId) {
      return res.status(404).send({ message: 'Not Found' });
    }

    return res.send(this.syncJobDtoFactory.createJson(syncJob));
  }

  async getSyncJobs(req, res) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    let syncJobs;
    try {
      syncJobs = await this.syncJobService.getSyncJobsByUserId(userId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(syncJobs.map((syncJob) => this.syncJobDtoFactory.createJson(syncJob)));
  }

  async postSyncJob(req, res) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    let syncJob;
    try {
      syncJob = await this.syncJobService.createSyncJob(userId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.status(201).send(this.syncJobDtoFactory.createJson(syncJob));
  }
}
