export class ActivityRepository {
  constructor({ activityModel }) {
    this.activityModel = activityModel;
  }

  findByActivityIds(activityIds) {
    return this.activityModel.find({ activityId: { $in: activityIds } });
  }

  findByUserId(userId) {
    return this.activityModel.find({ userId });
  }

  insertMany(activities) {
    return this.activityModel.insertMany(activities);
  }

  updateOneByActivityId(activityId, activity) {
    return this.activityModel.updateOne({ activityId }, activity);
  }
}
