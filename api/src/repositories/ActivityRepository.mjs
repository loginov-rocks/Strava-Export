export class ActivityRepository {
  constructor({ activityModel }) {
    this.activityModel = activityModel;
  }

  findByActivityIds(activityIds) {
    return this.activityModel.find({ activityId: { $in: activityIds } });
  }

  findByAthleteId(athleteId) {
    return this.activityModel.find({ athleteId });
  }

  insertMany(activities) {
    return this.activityModel.insertMany(activities);
  }

  updateOneByActivityId(activityId, activity) {
    return this.activityModel.updateOne({ activityId }, activity);
  }
}
