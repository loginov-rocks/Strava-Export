import { StravaDetailedActivity, StravaSummaryActivity } from '../apiClients/StravaApiClient';
import { ActivityDocument } from '../models/activityModel';

interface FormattedStravaData {
  name: string;
  sportType: string;
  startDateTime: string;
  distanceKilometers?: number;
  movingTimeMinutes?: number;
  totalElevationGain?: number;
  averageSpeedKilometersPerHour?: number;
  maxSpeedKilometersPerHour?: number;
  averageWatts?: number;
  maxWatts?: number;
  description?: string;
  calories?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
}

interface ActivityDto extends FormattedStravaData {
  id: string;
  userId: string;
}

interface ActivityWithStravaDataDto extends ActivityDto {
  stravaData: StravaDetailedActivity | StravaSummaryActivity;
}

export class ActivityDtoFactory {
  createJson(activity: ActivityDocument): ActivityDto {
    return {
      id: activity._id.toString(),
      userId: activity.userId,
      ...this.formatStravaData(activity.stravaData),
    };
  }

  createJsonCollection(activities: ActivityDocument[]): ActivityDto[] {
    return activities.map((activity) => this.createJson(activity));
  }

  createText(activity: ActivityDocument): string {
    const json = this.createJson(activity);

    const lines = [
      // Reorganized according to the importance of information for LLM.
      `Activity ID: ${json.id}`,
      `Date Time: ${new Date(json.startDateTime).toLocaleString()}`,
      `Sport Type: ${json.sportType}`,
      `Name: ${json.name}`,
    ];

    if (json.distanceKilometers) {
      lines.push(`Distance: ${json.distanceKilometers} km`);
    }

    if (json.movingTimeMinutes) {
      lines.push(`Moving Time: ${json.movingTimeMinutes} minutes`);
    }

    if (json.totalElevationGain) {
      lines.push(`Total Elevation Gain: ${json.totalElevationGain}`);
    }

    if (json.averageSpeedKilometersPerHour) {
      lines.push(`Average Speed: ${json.averageSpeedKilometersPerHour} km/h`);
    }

    if (json.maxSpeedKilometersPerHour) {
      lines.push(`Max Speed: ${json.maxSpeedKilometersPerHour} km/h`);
    }

    if (json.averageWatts) {
      lines.push(`Average Power: ${json.averageWatts} watts`);
    }

    if (json.maxWatts) {
      lines.push(`Max Power: ${json.maxWatts} watts`);
    }

    if (json.calories) {
      lines.push(`Calories: ${json.calories}`);
    }

    if (json.averageHeartRate) {
      lines.push(`Average Heart Rate: ${json.averageHeartRate} BPM`);
    }

    if (json.maxHeartRate) {
      lines.push(`Max Heart Rate: ${json.maxHeartRate} BPM`);
    }

    // The description was moved to the last since it may have critical information overriding the stats above.
    if (json.description) {
      lines.push(`User Comment (may have more precise information about this activity): ${json.description}`);
    }

    return lines.join('\n');
  }

  createTextCollection(activities: ActivityDocument[]): string {
    let text = '';

    activities.forEach((activity, index) => {
      text += this.createText(activity);

      if (index < activities.length - 1) {
        text += '\n\n---\n\n';
      }
    });

    return text;
  }

  createJsonWithStravaData(activity: ActivityDocument): ActivityWithStravaDataDto {
    return {
      id: activity._id.toString(),
      userId: activity.userId,
      ...this.formatStravaData(activity.stravaData),
      stravaData: activity.stravaData,
    };
  }

  createJsonWithStravaDataCollection(activities: ActivityDocument[]): ActivityWithStravaDataDto[] {
    return activities.map((activity) => this.createJsonWithStravaData(activity));
  }

  formatStravaData(stravaData: StravaDetailedActivity | StravaSummaryActivity): FormattedStravaData {
    const data: FormattedStravaData = {
      name: stravaData.name,
      sportType: stravaData.sport_type,
      startDateTime: stravaData.start_date,
    };

    const isValidNumeric = (value: undefined | null | number) => (
      value !== undefined && value !== null && value !== 0 && !isNaN(value)
    );

    const isValidText = (value: undefined | null | string) => (
      value !== undefined && typeof value === 'string' && value.trim() !== ''
    );

    if (isValidNumeric(stravaData.utc_offset) && isValidText(stravaData.start_date_local)) {
      const offsetHours = Math.floor(Math.abs(stravaData.utc_offset as number) / 3600);
      const offsetMins = Math.floor((Math.abs(stravaData.utc_offset as number) % 3600) / 60);
      const sign = (stravaData.utc_offset as number) >= 0 ? '+' : '-';
      const offsetString = `${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

      data.startDateTime = (stravaData.start_date_local as string).replace('Z', offsetString);
    }

    if (isValidNumeric(stravaData.distance)) {
      data.distanceKilometers = Number(((stravaData.distance as number) / 1000).toFixed(2));
    }

    if (isValidNumeric(stravaData.moving_time)) {
      data.movingTimeMinutes = Number(((stravaData.moving_time as number) / 60).toFixed(2));
    }

    if (isValidNumeric(stravaData.total_elevation_gain)) {
      data.totalElevationGain = stravaData.total_elevation_gain as number;
    }

    if (isValidNumeric(stravaData.average_speed)) {
      data.averageSpeedKilometersPerHour = Number(((stravaData.average_speed as number) * 3.6).toFixed(2));
    }

    if (isValidNumeric(stravaData.max_speed)) {
      data.maxSpeedKilometersPerHour = Number(((stravaData.max_speed as number) * 3.6).toFixed(2));
    }

    if (isValidNumeric(stravaData.average_watts)) {
      data.averageWatts = stravaData.average_watts as number;
    }

    if (isValidNumeric(stravaData.max_watts)) {
      data.maxWatts = stravaData.max_watts as number;
    }

    if (isValidText((stravaData as StravaDetailedActivity).description)) {
      data.description = ((stravaData as StravaDetailedActivity).description as string).trim();
    }

    if (isValidNumeric((stravaData as StravaDetailedActivity).calories)) {
      data.calories = (stravaData as StravaDetailedActivity).calories as number;
    }

    if (isValidNumeric(stravaData.average_heartrate)) {
      data.averageHeartRate = stravaData.average_heartrate as number;
    }

    if (isValidNumeric(stravaData.max_heartrate)) {
      data.maxHeartRate = stravaData.max_heartrate as number;
    }

    return data;
  }
}
