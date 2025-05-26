export class ActivityRepository {
  static FILTER_SPORT_TYPE = ['Hike', 'Ride', 'Run', 'Swim'];
  static FILTER_SORT = ['startDateTime'];
  static FILTER_ORDER = ['asc', 'desc'];

  getFilterScheme() {
    return {
      sportType: ActivityRepository.FILTER_SPORT_TYPE,
      sort: ActivityRepository.FILTER_SORT,
      order: ActivityRepository.FILTER_ORDER,
    };
  }

  constructor({ activityModel }) {
    this.activityModel = activityModel;
  }

  findById(id) {
    return this.activityModel.findById(id).lean();
  }

  findByStravaActivityIds(stravaActivityIds) {
    return this.activityModel.find({ stravaActivityId: { $in: stravaActivityIds } }).lean();
  }

  findByUserId(userId, filter) {
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

  findLastByUserId(userId, filter) {
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

  insertMany(activities) {
    return this.activityModel.insertMany(activities);
  }

  updateOneByStravaActivityId(stravaActivityId, activity) {
    return this.activityModel.updateOne({ stravaActivityId }, activity);
  }
}
