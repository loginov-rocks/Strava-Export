export class ActivityRepository {
  constructor({ activityModel }) {
    this.activityModel = activityModel;
  }

  findByStravaActivityIds(stravaActivityIds) {
    return this.activityModel.find({ stravaActivityId: { $in: stravaActivityIds } });
  }

  findByUserId(userId) {
    return this.activityModel.find({ userId });
  }

  insertMany(activities) {
    return this.activityModel.insertMany(activities);
  }

  updateOneByStravaActivityId(stravaActivityId, activity) {
    return this.activityModel.updateOne({ stravaActivityId }, activity);
  }
}
