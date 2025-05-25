export class ActivitiesController {
  constructor({ activityDtoFactory, activityService }) {
    this.activityDtoFactory = activityDtoFactory;
    this.activityService = activityService;

    this.getActivities = this.getActivities.bind(this);
    this.getActivity = this.getActivity.bind(this);
    this.getLastActivity = this.getLastActivity.bind(this);
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

    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.includes('text/plain')) {
      return res.type('text/plain').send(this.activityDtoFactory.createTextCollection(activities));
    }

    return res.send(withStravaData === 'true'
      ? this.activityDtoFactory.createJsonWithStravaDataCollection(activities)
      : this.activityDtoFactory.createJsonCollection(activities));
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

    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.includes('text/plain')) {
      return res.type('text/plain').send(this.activityDtoFactory.createText(activity));
    }

    return res.send(withStravaData === 'true'
      ? this.activityDtoFactory.createJsonWithStravaData(activity)
      : this.activityDtoFactory.createJson(activity));
  }

  async getLastActivity(req, res) {
    const { userId } = req;

    if (!userId) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { withStravaData } = req.query;

    let activity;
    try {
      activity = await this.activityService.getLastActivityByUserId(userId);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ message: 'Internal Server Error' });
    }

    if (!activity) {
      return res.status(404).send({ message: 'Not Found' });
    }

    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.includes('text/plain')) {
      return res.type('text/plain').send(this.activityDtoFactory.createText(activity));
    }

    return res.send(withStravaData === 'true'
      ? this.activityDtoFactory.createJsonWithStravaData(activity)
      : this.activityDtoFactory.createJson(activity));
  }
}
