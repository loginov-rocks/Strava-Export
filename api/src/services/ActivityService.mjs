export class ActivityService {
  constructor({ activityRepository }) {
    this.activityRepository = activityRepository;
  }

  async getActivitiesByUserId(userId) {
    const rawActivities = await this.getRawActivitiesByUserId(userId);

    return rawActivities.map((rawActivity) => this.formatRawActivity(rawActivity));
  }

  getRawActivitiesByUserId(userId) {
    return this.activityRepository.findByUserId(userId);
  }

  // @see https://developers.strava.com/docs/reference/#api-models-DetailedActivity
  formatRawActivity(rawActivity) {
    const activity = {
      name: rawActivity.name,
      sportType: rawActivity.sport_type,
      startDateTime: rawActivity.start_date,
    }

    const isValidNumeric = (value) => value !== undefined && value !== null && value !== 0 && !isNaN(value);
    const isValidText = (value) => value !== undefined && typeof value === 'string' && value.trim() !== '';

    if (isValidNumeric(rawActivity.distance)) {
      activity.distanceKilometers = Number((rawActivity.distance / 1000).toFixed(2));
    }

    if (isValidNumeric(rawActivity.moving_time)) {
      activity.movingTimeMinutes = Number((rawActivity.moving_time / 60).toFixed(2));
    }

    if (isValidNumeric(rawActivity.total_elevation_gain)) {
      activity.totalElevationGain = rawActivity.total_elevation_gain;
    }

    if (isValidNumeric(rawActivity.average_speed)) {
      activity.averageSpeedKilometersPerHour = Number((rawActivity.average_speed * 3.6).toFixed(2));
    }

    if (isValidNumeric(rawActivity.max_speed)) {
      activity.maxSpeedKilometersPerHour = Number((rawActivity.max_speed * 3.6).toFixed(2));
    }

    if (isValidNumeric(rawActivity.average_watts)) {
      activity.averageWatts = rawActivity.average_watts;
    }

    if (isValidNumeric(rawActivity.max_watts)) {
      activity.maxWatts = rawActivity.max_watts;
    }

    if (isValidText(rawActivity.description)) {
      activity.description = rawActivity.description.trim();
    }

    if (isValidNumeric(rawActivity.calories)) {
      activity.calories = rawActivity.calories;
    }

    if (isValidNumeric(rawActivity.average_heartrate)) {
      activity.averageHeartRate = rawActivity.average_heartrate;
    }

    if (isValidNumeric(rawActivity.max_heartrate)) {
      activity.maxHeartRate = rawActivity.max_heartrate;
    }

    return activity;
  }
}
