export class SyncJobController {
  constructor({ syncJobService }) {
    this.syncJobService = syncJobService;

    this.getSyncJob = this.getSyncJob.bind(this);
    this.getSyncJobs = this.getSyncJobs.bind(this);
    this.postSyncJob = this.postSyncJob.bind(this);
  }

  async getSyncJob(req, res) {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let job;
    try {
      job = await this.syncJobService.getSyncJob(jobId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(job);
  }

  async getSyncJobs(req, res) {
    const { athleteId } = req.query;

    if (!athleteId) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let jobs;
    try {
      jobs = await this.syncJobService.getSyncJobsByAthleteId(athleteId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(jobs);
  }

  async postSyncJob(req, res) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { athleteId } = req.body;

    if (!athleteId) {
      return res.status(404).send({ message: 'Bad Request' });
    }

    let job;
    try {
      job = await this.syncJobService.createSyncJob({ athleteId, accessToken: token });
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send({ jobId: job.id });
  }
}
