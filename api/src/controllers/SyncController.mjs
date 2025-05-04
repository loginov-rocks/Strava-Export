export class SyncController {
  constructor({ syncService }) {
    this.syncService = syncService;

    this.post = this.post.bind(this);
  }

  async post(req, res) {
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
      job = await this.syncService.createJob({ athleteId, accessToken: token });
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send({ jobId: job.id });
  }
}
