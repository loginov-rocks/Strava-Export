export class ActivityDtoFactory {
  createJson(activity) {
    return {
      id: activity._id.toString(),
      userId: activity.userId,
      ...this.formatStravaData(activity.stravaData),
    };
  }

  createJsonWithStravaData(activity) {
    return {
      id: activity._id.toString(),
      userId: activity.userId,
      ...this.formatStravaData(activity.stravaData),
      stravaData: activity.stravaData,
    };
  }

  // @see https://developers.strava.com/docs/reference/#api-models-DetailedActivity
  formatStravaData(stravaData) {
    const data = {
      name: stravaData.name,
      sportType: stravaData.sport_type,
      startDateTime: stravaData.start_date,
    }

    const isValidNumeric = (value) => value !== undefined && value !== null && value !== 0 && !isNaN(value);
    const isValidText = (value) => value !== undefined && typeof value === 'string' && value.trim() !== '';

    if (isValidNumeric(stravaData.distance)) {
      data.distanceKilometers = Number((stravaData.distance / 1000).toFixed(2));
    }

    if (isValidNumeric(stravaData.moving_time)) {
      data.movingTimeMinutes = Number((stravaData.moving_time / 60).toFixed(2));
    }

    if (isValidNumeric(stravaData.total_elevation_gain)) {
      data.totalElevationGain = stravaData.total_elevation_gain;
    }

    if (isValidNumeric(stravaData.average_speed)) {
      data.averageSpeedKilometersPerHour = Number((stravaData.average_speed * 3.6).toFixed(2));
    }

    if (isValidNumeric(stravaData.max_speed)) {
      data.maxSpeedKilometersPerHour = Number((stravaData.max_speed * 3.6).toFixed(2));
    }

    if (isValidNumeric(stravaData.average_watts)) {
      data.averageWatts = stravaData.average_watts;
    }

    if (isValidNumeric(stravaData.max_watts)) {
      data.maxWatts = stravaData.max_watts;
    }

    if (isValidText(stravaData.description)) {
      data.description = stravaData.description.trim();
    }

    if (isValidNumeric(stravaData.calories)) {
      data.calories = stravaData.calories;
    }

    if (isValidNumeric(stravaData.average_heartrate)) {
      data.averageHeartRate = stravaData.average_heartrate;
    }

    if (isValidNumeric(stravaData.max_heartrate)) {
      data.maxHeartRate = stravaData.max_heartrate;
    }

    return data;
  }
}
