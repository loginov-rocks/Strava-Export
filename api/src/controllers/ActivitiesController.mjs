export class ActivitiesController {
  constructor({ activityDtoFactory, activityService }) {
    this.activityDtoFactory = activityDtoFactory;
    this.activityService = activityService;

    this.getActivities = this.getActivities.bind(this);
  }

  async getActivities(req, res) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { withStravaData } = req.query;

    let activities;
    try {
      activities = await this.activityService.getActivitiesByUserId(userId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(activities.map((activity) => (
      withStravaData === 'true'
        ? this.activityDtoFactory.createJsonWithStravaData(activity)
        : this.activityDtoFactory.createJson(activity)
    )));
  }
}
