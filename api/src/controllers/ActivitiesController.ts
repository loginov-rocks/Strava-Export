import { Response } from 'express';

import { ActivityDtoFactory } from '../dtoFactories/ActivityDtoFactory';
import { CompositeAuthenticatedRequest } from '../middlewares/CompositeAuthMiddleware';
import { TokenAuthenticatedRequest } from '../middlewares/TokenMiddleware';
import { ActivityService } from '../services/ActivityService';
import {
  getDateAgoFromDays, getDateAgoFromMonths, getDateAgoFromWeeks, getDateAgoFromYears,
} from '../utils/getDateAgo';
import { isValidIsoDateString, isValidPositiveIntegerString } from '../utils/isValid';

interface Options {
  activityDtoFactory: ActivityDtoFactory;
  activityService: ActivityService;
}

export class ActivityController {
  private readonly activityDtoFactory: ActivityDtoFactory;
  private readonly activityService: ActivityService;

  constructor({ activityDtoFactory, activityService }: Options) {
    this.activityDtoFactory = activityDtoFactory;
    this.activityService = activityService;

    this.getActivities = this.getActivities.bind(this);
    this.deleteActivities = this.deleteActivities.bind(this);
    this.getLastActivity = this.getLastActivity.bind(this);
    this.getActivity = this.getActivity.bind(this);
  }

  public async getActivities(req: CompositeAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const {
      sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order, withStravaData,
    } = req.query;

    let filter;
    try {
      filter = this.createActivitiesFilter({
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

  public async deleteActivities(req: TokenAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    try {
      await this.activityService.deleteActivitiesByUserId(userId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.status(204).send();
  }

  public async getLastActivity(req: CompositeAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const { sportType, withStravaData } = req.query;

    let filter;
    try {
      filter = this.createActivitiesFilter({ sportType });
    } catch {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let activity;
    try {
      activity = await this.activityService.getLastActivityByUserId(userId, filter);
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

  private createActivitiesFilter({
    sportType, from, to, lastDays, lastWeeks, lastMonths, lastYears, sort, order,
  }: Record<string, unknown>) {
    // Inherit expected types from the service method signature rather than importing them across layers, which would
    // violate the separation of concerns and architectural boundaries.
    const filter: Parameters<typeof this.activityService.getActivitiesByUserId>[1]
      | Parameters<typeof this.activityService.getLastActivityByUserId>[1] = {};
    const filterValues = this.activityService.getFilterValues();

    if (sportType) {
      // Cast to any for runtime validation since TS only knows the sportType is unknown, not the specific literal
      // union type expected by the filter after validation.
      // eslint-disable-next-line
      if (filterValues.sportType.includes(sportType as any)) {
        filter.sportType = sportType as typeof filterValues.sportType[number];
      } else {
        throw new Error('Parameter "sportType" must be one of the allowed sport type values');
      }
    }

    if (from) {
      if (isValidIsoDateString(from)) {
        filter.from = from as string;
      } else {
        throw new Error('Parameter "from" must be a valid ISO date');
      }
    }

    if (to) {
      if (isValidIsoDateString(to)) {
        filter.to = to as string;
      } else {
        throw new Error('Parameter "to" must be a valid ISO date');
      }
    }

    if (filter.from && filter.to && new Date(filter.from) >= new Date(filter.to)) {
      throw new Error('Parameter "from" must be earlier than parameter "to"');
    }

    if (lastDays) {
      if (!isValidPositiveIntegerString(lastDays)) {
        throw new Error('Parameter "lastDays" must be a valid positive integer');
      }
      // Apply the lastDays filter only when explicit from/to dates are not provided, as they take precedence.
      else if (!filter.from && !filter.to) {
        filter.from = getDateAgoFromDays(parseInt(lastDays as string, 10)).toISOString();
      }
    }

    if (lastWeeks) {
      if (!isValidPositiveIntegerString(lastWeeks)) {
        throw new Error('Parameter "lastWeeks" must be a valid positive integer');
      }
      // Apply lastWeeks filter only when explicit from/to dates and lastDays are not provided, as they take
      // precedence and lastDays already sets the from parameter.
      else if (!filter.from && !filter.to) {
        filter.from = getDateAgoFromWeeks(parseInt(lastWeeks as string, 10)).toISOString();
      }
    }

    if (lastMonths) {
      if (!isValidPositiveIntegerString(lastMonths)) {
        throw new Error('Parameter "lastMonths" must be a valid positive integer');
      }
      // Apply lastWeeks filter only when explicit from/to dates, lastDays, and lastWeeks are not provided, as they
      // take precedence and lastDays already sets the from parameter.
      else if (!filter.from && !filter.to) {
        filter.from = getDateAgoFromMonths(parseInt(lastMonths as string, 10)).toISOString();
      }
    }

    if (lastYears) {
      if (!isValidPositiveIntegerString(lastYears)) {
        throw new Error('Parameter "lastYears" must be a valid positive integer');
      }
      // Apply lastWeeks filter only when explicit from/to dates, lastDays, lastWeeks, and lastMonths are not provided,
      // as they take precedence and lastDays already sets the from parameter.
      else if (!filter.from && !filter.to) {
        filter.from = getDateAgoFromYears(parseInt(lastYears as string, 10)).toISOString();
      }
    }

    if (sort) {
      // Cast to any for runtime validation since TS only knows the sort is unknown, not the specific literal union
      // type expected by the filter after validation.
      // eslint-disable-next-line
      if (filterValues.sort.includes(sort as any)) {
        filter.sort = sort as typeof filterValues.sort[number];
      } else {
        throw new Error('Parameter "sort" must be one of the allowed sort values');
      }
    }

    if (order) {
      // Cast to any for runtime validation since TS only knows the order is unknown, not the specific literal union
      // type expected by the filter after validation.
      // eslint-disable-next-line
      if (filterValues.order.includes(order as any)) {
        filter.order = order as typeof filterValues.order[number];
      } else {
        throw new Error('Parameter "order" must be one of the allowed order values');
      }
    }

    return filter;
  }
}
