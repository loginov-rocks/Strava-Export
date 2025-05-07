export class ActivitiesController {
  constructor({ activityService }) {
    this.activityService = activityService;

    this.getActivities = this.getActivities.bind(this);
  }

  async getActivities(req, res) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { raw } = req.query;

    let activities;
    try {
      if (raw === 'true') {
        activities = await this.activityService.getRawActivitiesByUserId(userId);
      } else {
        activities = await this.activityService.getActivitiesByUserId(userId);
      }
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(activities);
  }
}
