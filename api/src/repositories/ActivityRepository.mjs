export class ActivityRepository {
  constructor({ activityModel }) {
    this.activityModel = activityModel;
  }

  findById(id) {
    return this.activityModel.findById(id).lean();
  }

  findByStravaActivityIds(stravaActivityIds) {
    return this.activityModel.find({ stravaActivityId: { $in: stravaActivityIds } }).lean();
  }

  findByUserId(userId) {
    return this.activityModel.find({ userId }).sort({ 'stravaData.start_date': -1 }).lean();
  }

  findLatestByUserId(userId) {
    return this.activityModel.findOne({
      userId,
      'stravaData.start_date': { $exists: true, $ne: null }
    }).sort({ 'stravaData.start_date': -1 }).lean();
  }

  insertMany(activities) {
    return this.activityModel.insertMany(activities);
  }

  updateOneByStravaActivityId(stravaActivityId, activity) {
    return this.activityModel.updateOne({ stravaActivityId }, activity);
  }
}
