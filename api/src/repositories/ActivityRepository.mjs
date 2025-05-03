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

  updateOneByActivityId(activityId, fields) {
    return this.activityModel.updateOne({ activityId }, { $set: fields });
  }

  // @see https://developers.strava.com/docs/reference/#api-models-DetailedActivity
  format(activity) {
    const formattedActivity = {
      name: activity.name,
      sportType: activity.sport_type,
      startDateTime: activity.start_date,
    }

    const isValidNumeric = (value) => value !== undefined && value !== null && value !== 0 && !isNaN(value);
    const isValidText = (value) => value !== undefined && typeof value === 'string' && value.trim() !== '';

    if (isValidNumeric(activity.distance)) {
      formattedActivity.distanceKilometers = Number((activity.distance / 1000).toFixed(2));
    }

    if (isValidNumeric(activity.moving_time)) {
      formattedActivity.movingTimeMinutes = Number((activity.moving_time / 60).toFixed(2));
    }

    if (isValidNumeric(activity.total_elevation_gain)) {
      formattedActivity.totalElevationGain = activity.total_elevation_gain;
    }

    if (isValidNumeric(activity.average_speed)) {
      formattedActivity.averageSpeedKilometersPerHour = Number((activity.average_speed * 3.6).toFixed(2));
    }

    if (isValidNumeric(activity.max_speed)) {
      formattedActivity.maxSpeedKilometersPerHour = Number((activity.max_speed * 3.6).toFixed(2));
    }

    if (isValidNumeric(activity.average_watts)) {
      formattedActivity.averageWatts = activity.average_watts;
    }

    if (isValidNumeric(activity.max_watts)) {
      formattedActivity.maxWatts = activity.max_watts;
    }

    if (isValidText(activity.description)) {
      formattedActivity.description = activity.description.trim();
    }

    if (isValidNumeric(activity.calories)) {
      formattedActivity.calories = activity.calories;
    }

    if (isValidNumeric(activity.average_heartrate)) {
      formattedActivity.averageHeartRate = activity.average_heartrate;
    }

    if (isValidNumeric(activity.max_heartrate)) {
      formattedActivity.maxHeartRate = activity.max_heartrate;
    }

    return formattedActivity;
  }
}
