export class StravaController {
  constructor({ stravaSyncService }) {
    this.stravaSyncService = stravaSyncService;

    this.getProcessActivities = this.getProcessActivities.bind(this);
    this.postSync = this.postSync.bind(this);
  }

  async getProcessActivities(req, res) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    let result;
    try {
      result = await this.stravaSyncService.processPaginatedActivities(token);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(result);
  }

  async postSync(req, res) {
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
      job = await this.stravaSyncService.createJob({ athleteId, accessToken: token });
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send({
      jobId: job.id,
    });
  }
}
