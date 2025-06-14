import { Response } from 'express';

import { ActivityDtoFactory } from '../dtoFactories/ActivityDtoFactory';
import { CompositeAuthenticatedRequest } from '../middlewares/CompositeAuthMiddleware';
import { ActivityService } from '../services/ActivityService';

interface Options {
  activityDtoFactory: ActivityDtoFactory;
  activityService: ActivityService;
}

interface GetActivitiesFilterParameters {
  sportType?: string;
  from?: string;
  to?: string;
  lastDays?: string;
  lastWeeks?: string;
  lastMonths?: string;
  lastYears?: string;
  sort?: string;
  order?: string;
}

export class ActivityController {
  private readonly activityDtoFactory: ActivityDtoFactory;
  private readonly activityService: ActivityService;

  constructor({ activityDtoFactory, activityService }: Options) {
    this.activityDtoFactory = activityDtoFactory;
    this.activityService = activityService;

    this.getActivities = this.getActivities.bind(this);
    this.getLastActivity = this.getLastActivity.bind(this);
    this.getActivity = this.getActivity.bind(this);
  }

  public async getActivities(req: CompositeAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const { sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order, withStravaData } = req.query;

    if ((sportType && typeof sportType !== 'string') ||
      (from && typeof from !== 'string') ||
      (to && typeof to !== 'string') ||
      (lastDays && typeof lastDays !== 'string') ||
      (lastWeeks && typeof lastWeeks !== 'string') ||
      (lastMonths && typeof lastMonths !== 'string') ||
      (lastYears && typeof lastYears !== 'string') ||
      (sort && typeof sort !== 'string') ||
      (order && typeof order !== 'string')) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let filter;
    try {
      filter = this.createGetActivitiesFilter({
        sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order,
      });
    } catch {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let activities;
    try {
      activities = await this.activityService.getActivitiesByUserId(userId, filter);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.includes('text/plain')) {
      res.type('text/plain').send(this.activityDtoFactory.createTextCollection(activities));
      return;
    }

    res.send(withStravaData === 'true'
      ? this.activityDtoFactory.createJsonWithStravaDataCollection(activities)
      : this.activityDtoFactory.createJsonCollection(activities));
  }

  public async getLastActivity(req: CompositeAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const { sportType, withStravaData } = req.query;

    const filterScheme = this.activityService.getFilterScheme();

    if (sportType && (typeof sportType !== 'string' || !filterScheme.sportType.includes(sportType))) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let activity;
    try {
      activity = await this.activityService.getLastActivityByUserId(userId, { sportType });
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!activity) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.includes('text/plain')) {
      res.type('text/plain').send(this.activityDtoFactory.createText(activity));
      return;
    }

    res.send(withStravaData === 'true'
      ? this.activityDtoFactory.createJsonWithStravaData(activity)
      : this.activityDtoFactory.createJson(activity));
  }

  public async getActivity(req: CompositeAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const { activityId } = req.params;

    if (!activityId) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    const { withStravaData } = req.query;

    let activity;
    try {
      activity = await this.activityService.getActivity(activityId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!activity || activity.userId !== userId) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.includes('text/plain')) {
      res.type('text/plain').send(this.activityDtoFactory.createText(activity));
      return;
    }

    res.send(withStravaData === 'true'
      ? this.activityDtoFactory.createJsonWithStravaData(activity)
      : this.activityDtoFactory.createJson(activity));
  }

  // TODO: Revisit implementation.
  private createGetActivitiesFilter({
    sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order,
  }: GetActivitiesFilterParameters) {
    const filterScheme = this.activityService.getFilterScheme();

    const isValidISODate = (value: string) => {
      const date = new Date(value);

      return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === value;
    };

    const isValidPositiveInteger = (value: string) => {
      const num = parseInt(value, 10);

      return !isNaN(num) && num > 0 && num.toString() === value.toString();
    };

    if (sportType && !filterScheme.sportType.includes(sportType)) {
      throw new Error('Incorrect sport type parameter');
    }

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

    if ((sort && !filterScheme.sort.includes(sort)) || (order && !filterScheme.order.includes(order))) {
      throw new Error('Incorrect sort or order parameters');
    }

    let calculatedFrom: undefined | string | Date = from;

    if (!from && !to && (lastDays || lastWeeks || lastMonths || lastYears)) {
      const now = new Date();

      if (lastDays) {
        calculatedFrom = new Date(now.getTime() - (parseInt(lastDays, 10) * 24 * 60 * 60 * 1000));
      } else if (lastWeeks) {
        calculatedFrom = new Date(now.getTime() - (parseInt(lastWeeks, 10) * 7 * 24 * 60 * 60 * 1000));
      } else if (lastMonths) {
        calculatedFrom = new Date(now);
        calculatedFrom.setMonth(calculatedFrom.getMonth() - parseInt(lastMonths, 10));

        // Fix for incorrect dates.
        if (calculatedFrom.getDate() !== now.getDate()) {
          calculatedFrom.setDate(0);
        }
      } else if (lastYears) {
        calculatedFrom = new Date(now);
        calculatedFrom.setFullYear(calculatedFrom.getFullYear() - parseInt(lastYears, 10));
      }

      calculatedFrom = (calculatedFrom as Date).toISOString();
    }

    return {
      sportType,
      from: calculatedFrom,
      to,
      sort: sort ? sort : 'startDateTime',
      order: order ? order : 'desc',
    };
  }
}
