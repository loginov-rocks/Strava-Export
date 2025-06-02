import { StravaDetailedActivity, StravaSummaryActivity } from '../apiClients/StravaApiClient';
import { ActivityDocument } from '../models/activityModel';

interface NormalizedStravaData {
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

interface ActivityDto extends NormalizedStravaData {
  id: string;
  userId: string;
}

interface StatsPerSportType {
  activitiesCount: number;
  distanceKilometers?: number;
  movingTimeMinutes?: number;
  totalElevationGain?: number;
  calories?: number;
}

interface Stats {
  [key: string]: StatsPerSportType;
}

interface ActivitiesCollectionDto {
  activitiesCount: number;
  activities: ActivityDto[];
  stats: Stats;
}

interface ActivityWithStravaDataDto extends ActivityDto {
  stravaData: StravaDetailedActivity | StravaSummaryActivity;
}

interface ActivitiesWithStravaDataCollectionDto {
  activitiesCount: number;
  activities: ActivityWithStravaDataDto[];
  stats: Stats;
}

export class ActivityDtoFactory {
  public createJson(activity: ActivityDocument): ActivityDto {
    return {
      id: activity._id.toString(),
      userId: activity.userId,
      ...this.normalizeStravaData(activity.stravaData),
    };
  }

  public createJsonCollection(activities: ActivityDocument[]): ActivitiesCollectionDto {
    const activityDtos = activities.map((activity) => this.createJson(activity));

    return {
      activitiesCount: activityDtos.length,
      activities: activityDtos,
      stats: this.calculateStats(activityDtos),
    };
  }

  public createJsonWithStravaData(activity: ActivityDocument): ActivityWithStravaDataDto {
    return {
      ...this.createJson(activity),
      stravaData: activity.stravaData,
    };
  }

  public createJsonWithStravaDataCollection(activities: ActivityDocument[]): ActivitiesWithStravaDataCollectionDto {
    const activityWithStravaDataDtos = activities.map((activity) => this.createJsonWithStravaData(activity));

    return {
      activitiesCount: activityWithStravaDataDtos.length,
      activities: activityWithStravaDataDtos,
      stats: this.calculateStats(activityWithStravaDataDtos),
    };
  }

  private createTextFromDto(activityDto: ActivityDto): string {
    const lines = [
      // Reorganized according to the importance of information for LLM.
      `Activity ID: ${activityDto.id}`,
      `Date Time: ${new Date(activityDto.startDateTime).toLocaleString()}`,
      `Sport Type: ${activityDto.sportType}`,
      `Name: ${activityDto.name}`,
    ];

    if (activityDto.distanceKilometers) {
      lines.push(`Distance: ${activityDto.distanceKilometers} km`);
    }

    if (activityDto.movingTimeMinutes) {
      lines.push(`Moving Time: ${activityDto.movingTimeMinutes} minutes`);
    }

    // TODO: Figure out what units Strava use for elevation gain.
    if (activityDto.totalElevationGain) {
      lines.push(`Total Elevation Gain: ${activityDto.totalElevationGain}`);
    }

    if (activityDto.averageSpeedKilometersPerHour) {
      lines.push(`Average Speed: ${activityDto.averageSpeedKilometersPerHour} km/h`);
    }

    if (activityDto.maxSpeedKilometersPerHour) {
      lines.push(`Max Speed: ${activityDto.maxSpeedKilometersPerHour} km/h`);
    }

    if (activityDto.averageWatts) {
      lines.push(`Average Power: ${activityDto.averageWatts} watts`);
    }

    if (activityDto.maxWatts) {
      lines.push(`Max Power: ${activityDto.maxWatts} watts`);
    }

    if (activityDto.calories) {
      lines.push(`Calories: ${activityDto.calories}`);
    }

    if (activityDto.averageHeartRate) {
      lines.push(`Average Heart Rate: ${activityDto.averageHeartRate} BPM`);
    }

    if (activityDto.maxHeartRate) {
      lines.push(`Max Heart Rate: ${activityDto.maxHeartRate} BPM`);
    }

    // The description was moved to the last since it may have critical information overriding the stats above.
    if (activityDto.description) {
      lines.push(`User Comment (may have more precise information about this activity): ${activityDto.description}`);
    }

    return lines.join('\n');
  }

  public createText(activity: ActivityDocument): string {
    return this.createTextFromDto(this.createJson(activity));
  }

  private createTextStats(stats: Stats): string {
    let text = '';

    Object.keys(stats).forEach((sportType, index, arr) => {
      text += `## ${sportType}\n`;

      const statsPerSportType = stats[sportType];
      const lines = [
        `Total Sessions: ${statsPerSportType.activitiesCount}`,
      ];

      if (statsPerSportType.distanceKilometers) {
        lines.push(`Distance: ${statsPerSportType.distanceKilometers} km`);
      }

      if (statsPerSportType.movingTimeMinutes) {
        lines.push(`Moving Time: ${statsPerSportType.movingTimeMinutes} minutes`);
      }

      // TODO: Figure out what units Strava use for elevation gain.
      if (statsPerSportType.totalElevationGain) {
        lines.push(`Total Elevation Gain: ${statsPerSportType.totalElevationGain}`);
      }

      if (statsPerSportType.calories) {
        lines.push(`Calories: ${statsPerSportType.calories}`);
      }

      text += `- ${lines.join('\n- ')}`;

      if (index < arr.length - 1) {
        text += '\n\n';
      }
    });

    return text;
  }

  public createTextCollection(activities: ActivityDocument[]): string {
    if (activities.length === 0) {
      return 'No activites found';
    }

    const activityDtos = activities.map((activity) => this.createJson(activity));

    let text = '# ACTIVITIES SUMMARY\n\n';
    text += `Total Activities: ${activityDtos.length}\n\n`;

    text += this.createTextStats(this.calculateStats(activityDtos));

    text += '\n\n# ACTIVITIES DETAILS\n\n';

    activityDtos.forEach((activityDto, index, arr) => {
      text += this.createTextFromDto(activityDto);

      if (index < arr.length - 1) {
        text += '\n\n---\n\n';
      }
    });

    return text;
  }

  // TODO: Revisit implementation.
  private normalizeStravaData(stravaData: StravaDetailedActivity | StravaSummaryActivity): NormalizedStravaData {
    const data: NormalizedStravaData = {
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

  private calculateStats(activityDtos: ActivityDto[]): Stats {
    const stats: Stats = {};
    const keys: Array<keyof StatsPerSportType & keyof ActivityDto> = [
      'distanceKilometers', 'movingTimeMinutes', 'totalElevationGain', 'calories',
    ];

    activityDtos.forEach((activityDto) => {
      const { sportType } = activityDto;

      if (!stats[sportType]) {
        stats[sportType] = {
          activitiesCount: 0,
        };
      }

      stats[sportType].activitiesCount++;

      keys.forEach((key) => {
        if (activityDto[key]) {
          if (stats[sportType][key]) {
            stats[sportType][key] += activityDto[key];
          } else {
            stats[sportType][key] = activityDto[key];
          }
        }
      });
    });

    return stats;
  }
}
