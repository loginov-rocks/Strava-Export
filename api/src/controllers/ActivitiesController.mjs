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

    const { from, lastDays, lastWeeks, lastMonths, lastYears, order, sort, sportType, to, withStravaData } = req.query;

    let filter;
    try {
      filter = this.createActivitiesFilter({
        from, lastDays, lastWeeks, lastMonths, lastYears, order, sort, sportType, to,
      });
    } catch {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let activities;
    try {
      activities = await this.activityService.getActivitiesByUserId(userId, filter);
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

    const { sportType, withStravaData } = req.query;

    const filterScheme = this.activityService.getFilterScheme();

    if (sportType && !filterScheme.sportType.includes(sportType)) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let activity;
    try {
      activity = await this.activityService.getLastActivityByUserId(userId, { sportType });
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

  createActivitiesFilter({ from, lastDays, lastWeeks, lastMonths, lastYears, order, sort, sportType, to }) {
    const filterScheme = this.activityService.getFilterScheme();

    const isValidISODate = (value) => {
      const date = new Date(value);

      return date instanceof Date && !isNaN(date) && date.toISOString() === value;
    };

    const isValidPositiveInteger = (value) => {
      const num = parseInt(value, 10);

      return !isNaN(num) && num > 0 && num.toString() === value.toString();
    };

    if ((from && !isValidISODate(from)) || (to && !isValidISODate(to)) ||
      (from && to && new Date(from) >= new Date(to))) {
      throw new Error('Incorrect from or to parameters');
    }

    if ((lastDays && !isValidPositiveInteger(lastDays)) ||
      (lastWeeks && !isValidPositiveInteger(lastWeeks)) ||
      (lastMonths && !isValidPositiveInteger(lastMonths)) ||
      (lastYears && !isValidPositiveInteger(lastYears))) {
      throw new Error('Incorrect lastDays, lastWeeks, lastMonths or lastYears parameters');
    }

    if ((order && !filterScheme.order.includes(order)) || (sort && !filterScheme.sort.includes(sort))) {
      throw new Error('Incorrect order or sort parameters');
    }

    if (sportType && !filterScheme.sportType.includes(sportType)) {
      throw new Error('Incorrect sport type parameter');
    }

    let calculatedFrom = from;

    if (!from && !to && (lastDays || lastWeeks || lastMonths || lastYears)) {
      const now = new Date();

      if (lastDays) {
        calculatedFrom = new Date(now.getTime() - (parseInt(lastDays, 10) * 24 * 60 * 60 * 1000));
      } else if (lastWeeks) {
        calculatedFrom = new Date(now.getTime() - (parseInt(lastWeeks, 10) * 7 * 24 * 60 * 60 * 1000));
      } else if (lastMonths) {
        calculatedFrom = new Date(now);
        calculatedFrom.setMonth(calculatedFrom.getMonth() - parseInt(lastMonths, 10));

        if (calculatedFrom.getDate() !== now.getDate()) {
          calculatedFrom.setDate(0);
        }
      } else if (lastYears) {
        calculatedFrom = new Date(now);
        calculatedFrom.setFullYear(calculatedFrom.getFullYear() - parseInt(lastYears, 10));
      }

      calculatedFrom = calculatedFrom.toISOString();
    }

    return {
      from: calculatedFrom,
      order: order ? order : 'desc',
      sort: sort ? sort : 'startDateTime',
      sportType,
      to,
    };
  }
}
