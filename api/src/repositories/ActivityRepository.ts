import { ActivityModel } from '../models/activityModel';

interface Options {
  activityModel: ActivityModel;
}

// TODO: Match types to the allowed in ActivityRepository static props.
export interface Filter {
  sportType?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: string;
}

export class ActivityRepository {
  private static FILTER_SPORT_TYPE = ['Hike', 'Ride', 'Run', 'Swim'];
  private static FILTER_SORT = ['startDateTime'];
  private static FILTER_ORDER = ['asc', 'desc'];

  private readonly activityModel: ActivityModel;

  constructor({ activityModel }: Options) {
    this.activityModel = activityModel;
  }

  public findById(id: string) {
    return this.activityModel.findById(id).lean();
  }

  public findByStravaActivityIds(stravaActivityIds: string[]) {
    return this.activityModel.find({ stravaActivityId: { $in: stravaActivityIds } }).lean();
  }

  public findByUserId(userId: string, filter?: Filter) {
    const findParams = { userId };

    if (filter) {
      if (filter.sportType) {
        findParams['stravaData.sport_type'] = filter.sportType;
      }
      if (filter.from || filter.to) {
        findParams['stravaData.start_date'] = {};
        if (filter.from) {
          findParams['stravaData.start_date'].$gte = filter.from;
        }
        if (filter.to) {
          findParams['stravaData.start_date'].$lte = filter.to;
        }
      }
    }

    let query = this.activityModel.find(findParams);

    if (filter && filter.sort && filter.order) {
      const sortField = filter.sort === 'startDateTime' ? 'stravaData.start_date' : filter.sort;
      const sortOrder = filter.order === 'asc' ? 1 : -1;

      query = query.sort({ [sortField]: sortOrder });
    }

    return query.lean();
  }

  public findLastByUserId(userId: string, filter?: Filter) {
    const findParams = {
      userId,
      'stravaData.start_date': { $exists: true, $ne: null },
    };

    if (filter) {
      if (filter.sportType) {
        findParams['stravaData.sport_type'] = filter.sportType;
      }
    }

    return this.activityModel.findOne(findParams).sort({ 'stravaData.start_date': -1 }).lean();
  }

  public getFilterScheme() {
    return {
      sportType: ActivityRepository.FILTER_SPORT_TYPE,
      sort: ActivityRepository.FILTER_SORT,
      order: ActivityRepository.FILTER_ORDER,
    };
  }

  public insertMany(activities: ActivityModel[]) {
    return this.activityModel.insertMany(activities);
  }

  public updateOneByStravaActivityId(stravaActivityId: string, activity: ActivityModel) {
    return this.activityModel.updateOne({ stravaActivityId }, activity);
  }
}
