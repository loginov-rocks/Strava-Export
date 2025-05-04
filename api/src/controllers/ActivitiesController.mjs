export class ActivitiesController {
  constructor({ activityService }) {
    this.activityService = activityService;

    this.getActivities = this.getActivities.bind(this);
  }

  async getActivities(req, res) {
    const { athleteId, raw } = req.query;

    if (!athleteId) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let activities;
    try {
      if (raw === 'true') {
        activities = await this.activityService.getRawActivitiesByAthleteId(athleteId);
      } else {
        activities = await this.activityService.getActivitiesByAthleteId(athleteId);
      }
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(activities);
  }
}
