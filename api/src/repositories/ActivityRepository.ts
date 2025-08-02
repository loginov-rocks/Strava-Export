import { RootFilterQuery } from 'mongoose';

import { ActivityData, ActivityDocument, ActivityModel } from '../models/activityModel';

import { BaseRepository } from './BaseRepository';

interface Options {
  activityModel: ActivityModel;
}

// Extract the sport type constraint from the ActivityData to ensure filtering is limited to what can be stored in
// the database. This maintains architectural boundaries by getting type information through the model layer rather
// than directly importing from StravaApiClient. Defined outside the class so it can be reused both in the exported
// ActivityRepositoryFilter interface type definition and in the class methods for runtime validation.
// @see /api/src/apiClients/StravaApiClient.ts
const FILTER_SPORT_TYPE_VALUES: Array<ActivityData['stravaData']['sport_type']> = [
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

export class ActivityRepository extends BaseRepository<ActivityData, ActivityDocument> {
  constructor({ activityModel }: Options) {
    super({ model: activityModel });
  }

  public deleteByUserId(userId: string) {
    return this.model.deleteMany({ userId });
  }

  public findByStravaActivityId(stravaActivityId: string) {
    return this.model.findOne({ stravaActivityId });
  }

  public findByStravaActivityIds(stravaActivityIds: string[]) {
    return this.model.find({ stravaActivityId: { $in: stravaActivityIds } });
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

    let query = this.model.find(findParams);

    if (filter && filter.sort && filter.order) {
      const sortField = filter.sort === 'startDateTime' ? 'stravaData.start_date' : filter.sort;
      const sortOrder = filter.order === 'asc' ? 1 : -1;

      query = query.sort({ [sortField]: sortOrder });
    }

    return query;
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

    return this.model.findOne(findParams).sort({ 'stravaData.start_date': -1 });
  }

  // Defined as an instance method instead of making it static to keep consistency across class usage.
  public getFilterValues() {
    return {
      sportType: FILTER_SPORT_TYPE_VALUES,
      sort: FILTER_SORT_VALUES,
      order: FILTER_ORDER_VALUES,
    };
  }

  public updateByStravaActivityId(stravaActivityId: string, activityData: Partial<ActivityData>) {
    return this.model.updateOne({ stravaActivityId }, activityData);
  }
}
