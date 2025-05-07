export class ActivityRepository {
  constructor({ activityModel }) {
    this.activityModel = activityModel;
  }

  findByStravaActivityIds(stravaActivityIds) {
    return this.activityModel.find({ stravaActivityId: { $in: stravaActivityIds } }).lean();
  }

  findByUserId(userId) {
    return this.activityModel.find({ userId }).lean();
  }

  insertMany(activities) {
    return this.activityModel.insertMany(activities);
  }

  updateOneByStravaActivityId(stravaActivityId, activity) {
    return this.activityModel.updateOne({ stravaActivityId }, activity);
  }
}
