import { RootFilterQuery } from 'mongoose';

import { ActivityDocument, ActivityModel, ActivitySchema } from '../models/activityModel';

interface Options {
  activityModel: ActivityModel;
}

// Extract the sport type constraint from the ActivitySchema to ensure filtering is limited to what can be stored in
// the database. This maintains architectural boundaries by getting type information through the model layer rather
// than directly importing from StravaApiClient. Defined outside the class so it can be reused both in the exported
// ActivityRepositoryFilter interface type definition and in the class methods for runtime validation.
// @see /api/src/apiClients/StravaApiClient.ts
const FILTER_SPORT_TYPE_VALUES: Array<ActivitySchema['stravaData']['sport_type']> = [
  'AlpineSki', 'BackcountrySki', 'Badminton', 'Canoeing', 'Crossfit', 'EBikeRide', 'Elliptical', 'EMountainBikeRide',
  'Golf', 'GravelRide', 'Handcycle', 'HighIntensityIntervalTraining', 'Hike', 'IceSkate', 'InlineSkate', 'Kayaking',
  'Kitesurf', 'MountainBikeRide', 'NordicSki', 'Pickleball', 'Pilates', 'Racquetball', 'Ride', 'RockClimbing',
  'RollerSki', 'Rowing', 'Run', 'Sail', 'Skateboard', 'Snowboard', 'Snowshoe', 'Soccer', 'Squash', 'StairStepper',
  'StandUpPaddling', 'Surfing', 'Swim', 'TableTennis', 'Tennis', 'TrailRun', 'Velomobile', 'VirtualRide', 'VirtualRow',
  'VirtualRun', 'Walk', 'WeightTraining', 'Wheelchair', 'Windsurf', 'Workout', 'Yoga',
] as const;
const FILTER_SORT_VALUES = ['startDateTime'] as const;
const FILTER_ORDER_VALUES = ['asc', 'desc'] as const;

interface Filter {
  sportType?: typeof FILTER_SPORT_TYPE_VALUES[number];
  from?: string;
  to?: string;
  sort?: typeof FILTER_SORT_VALUES[number];
  order?: typeof FILTER_ORDER_VALUES[number];
}

export class ActivityRepository {
  private readonly activityModel: ActivityModel;

  constructor({ activityModel }: Options) {
    this.activityModel = activityModel;
  }

  public deleteByUserId(userId: string) {
    return this.activityModel.deleteMany({ userId });
  }

  public findById(id: string) {
    return this.activityModel.findById(id).lean();
  }

  public findByStravaActivityIds(stravaActivityIds: string[]) {
    return this.activityModel.find({ stravaActivityId: { $in: stravaActivityIds } }).lean();
  }

  public findByUserId(userId: string, filter?: Filter) {
    const findParams: RootFilterQuery<ActivityDocument> = { userId };

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
    const findParams: RootFilterQuery<ActivityDocument> = {
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

  // Defined as an instance method instead of making it static to keep consistency across class usage.
  public getFilterValues() {
    return {
      sportType: FILTER_SPORT_TYPE_VALUES,
      sort: FILTER_SORT_VALUES,
      order: FILTER_ORDER_VALUES,
    };
  }

  public insertMany(activities: ActivitySchema[]) {
    return this.activityModel.insertMany(activities);
  }

  public updateOneByStravaActivityId(stravaActivityId: string, activityData: Partial<ActivitySchema>) {
    return this.activityModel.updateOne({ stravaActivityId }, activityData);
  }
}
