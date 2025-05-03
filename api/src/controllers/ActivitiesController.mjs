export class ActivitiesController {
  constructor({ activityRepository }) {
    this.activityRepository = activityRepository;

    this.getActivities = this.getActivities.bind(this);
  }

  async getActivities(req, res) {
    const { athleteId, format } = req.query;

    if (!athleteId) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let activities;
    try {
      activities = await this.activityRepository.findByAthleteId(athleteId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    if (format !== 'false') {
      activities = activities.map((activity) => this.activityRepository.format(activity));
    }

    return res.send(activities);
  }
}
