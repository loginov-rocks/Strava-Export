export class ActivitiesController {
  constructor({ activityDtoFactory, activityService }) {
    this.activityDtoFactory = activityDtoFactory;
    this.activityService = activityService;

    this.getActivities = this.getActivities.bind(this);
    this.getActivity = this.getActivity.bind(this);
    this.getLatestActivity = this.getLatestActivity.bind(this);
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

  async getActivity(req, res) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { activityId } = req.params;

    if (!activityId) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    const { withStravaData } = req.query;

    let activity;
    try {
      activity = await this.activityService.getActivity(activityId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    if (!activity || activity.userId !== userId) {
      return res.status(404).send({ message: 'Not Found' });
    }

    return res.send(
      withStravaData === 'true'
        ? this.activityDtoFactory.createJsonWithStravaData(activity)
        : this.activityDtoFactory.createJson(activity)
    );
  }

  async getLatestActivity(req, res) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { withStravaData } = req.query;

    let activity;
    try {
      activity = await this.activityService.getLatestActivityByUserId(userId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    return res.send(
      withStravaData === 'true'
        ? this.activityDtoFactory.createJsonWithStravaData(activity)
        : this.activityDtoFactory.createJson(activity)
    );
  }
}
