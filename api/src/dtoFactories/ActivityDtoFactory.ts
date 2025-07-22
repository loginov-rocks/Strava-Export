import { StravaDetailedActivity, StravaSportType, StravaSummaryActivity } from '../apiClients/StravaApiClient';
import { ActivityDocument } from '../models/activityModel';
import {
  formatIsoDateStringToLocaleString, formatLocalDateStringWithTimezone, formatNumberToTwoDecimals,
} from '../utils/format';
import { isValidNonEmptyString, isValidNonZeroNumber } from '../utils/isValid';

interface NormalizedStravaData {
  name: string;
  sportType: StravaSportType;
  startDateTime: string;
  distanceMeters?: number;
  distanceKilometers?: number;
  movingTimeMinutes?: number;
  totalElevationGainMeters?: number;
  averageSpeedKilometersPerHour?: number;
  averagePaceMinutesPerKilometer?: number;
  averagePaceMinutesPer100Meters?: number;
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
  distanceMeters?: number;
  distanceKilometers?: number;
  movingTimeMinutes?: number;
  totalElevationGainMeters?: number;
  maxSpeedKilometersPerHour?: number;
  maxWatts?: number;
  calories?: number;
  maxHeartRate?: number;
}

type Stats = Partial<Record<StravaSportType, StatsPerSportType>>;

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
  private static readonly SWIM_SPORT_TYPE_VALUES: StravaSportType[] = ['Swim'];

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
      `Date Time: ${formatIsoDateStringToLocaleString(activityDto.startDateTime)}`,
      `Sport Type: ${activityDto.sportType}`,
      `Name: "${activityDto.name}"`,
    ];

    if (ActivityDtoFactory.SWIM_SPORT_TYPE_VALUES.includes(activityDto.sportType)) {
      if (activityDto.distanceMeters) {
        lines.push(`Distance: ${activityDto.distanceMeters} m`);
      }
    } else if (activityDto.distanceKilometers) {
      lines.push(`Distance: ${activityDto.distanceKilometers} km`);
    }

    if (activityDto.movingTimeMinutes) {
      lines.push(`Moving Time: ${activityDto.movingTimeMinutes} minutes`);
    }

    if (activityDto.totalElevationGainMeters) {
      lines.push(`Total Elevation Gain: ${activityDto.totalElevationGainMeters} meters`);
    }

    if (activityDto.averageSpeedKilometersPerHour) {
      lines.push(`Average Speed: ${activityDto.averageSpeedKilometersPerHour} km/h`);
    }

    if (ActivityDtoFactory.SWIM_SPORT_TYPE_VALUES.includes(activityDto.sportType)) {
      if (activityDto.averagePaceMinutesPer100Meters) {
        lines.push(`Average Pace: ${activityDto.averagePaceMinutesPer100Meters} min/100 m`);
      }
    } else if (activityDto.averagePaceMinutesPerKilometer) {
      lines.push(`Average Pace: ${activityDto.averagePaceMinutesPerKilometer} min/km`);
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
      lines.push(`User Comment (may have more precise information about this activity):`);
      lines.push(`> ${activityDto.description.split('\n').join('\n> ')}`);
    }

    return lines.join('\n');
  }

  public createText(activity: ActivityDocument): string {
    return this.createTextFromDto(this.createJson(activity));
  }

  private createTextStats(stats: Stats): string {
    let text = '';

    Object.entries(stats).forEach(([sportType, statsPerSportType], index, arr) => {
      text += `## ${sportType}\n`;

      const lines = [
        `Total Sessions: ${statsPerSportType.activitiesCount}`,
      ];

      if (ActivityDtoFactory.SWIM_SPORT_TYPE_VALUES.includes(sportType as StravaSportType)) {
        if (statsPerSportType.distanceMeters) {
          lines.push(`Distance: ${statsPerSportType.distanceMeters} m`);
        }
      } else if (statsPerSportType.distanceKilometers) {
        lines.push(`Distance: ${statsPerSportType.distanceKilometers} km`);
      }

      if (statsPerSportType.movingTimeMinutes) {
        lines.push(`Moving Time: ${statsPerSportType.movingTimeMinutes} minutes`);
      }

      if (statsPerSportType.totalElevationGainMeters) {
        lines.push(`Total Elevation Gain: ${statsPerSportType.totalElevationGainMeters} meters`);
      }

      if (statsPerSportType.maxSpeedKilometersPerHour) {
        lines.push(`Max Speed: ${statsPerSportType.maxSpeedKilometersPerHour} km/h`);
      }

      if (statsPerSportType.maxWatts) {
        lines.push(`Max Power: ${statsPerSportType.maxWatts} watts`);
      }

      if (statsPerSportType.calories) {
        lines.push(`Calories: ${statsPerSportType.calories}`);
      }

      if (statsPerSportType.maxHeartRate) {
        lines.push(`Max Heart Rate: ${statsPerSportType.maxHeartRate} BPM`);
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

  private normalizeStravaData(stravaData: StravaDetailedActivity | StravaSummaryActivity): NormalizedStravaData {
    const data: NormalizedStravaData = {
      name: stravaData.name,
      sportType: stravaData.sport_type,
      startDateTime: stravaData.start_date,
    };

    // Provide startDateTime with timezone only if the UTC offset is non-zero.
    if (isValidNonZeroNumber(stravaData.utc_offset) && isValidNonEmptyString(stravaData.start_date_local)) {
      data.startDateTime = formatLocalDateStringWithTimezone(stravaData.start_date_local as string,
        stravaData.utc_offset as number);
    }

    if (isValidNonZeroNumber(stravaData.distance)) {
      data.distanceMeters = formatNumberToTwoDecimals(stravaData.distance as number);
      data.distanceKilometers = formatNumberToTwoDecimals((stravaData.distance as number) / 1000);
    }

    if (isValidNonZeroNumber(stravaData.moving_time)) {
      data.movingTimeMinutes = formatNumberToTwoDecimals((stravaData.moving_time as number) / 60);
    }

    if (isValidNonZeroNumber(stravaData.total_elevation_gain)) {
      data.totalElevationGainMeters = formatNumberToTwoDecimals(stravaData.total_elevation_gain as number);
    }

    if (isValidNonZeroNumber(stravaData.average_speed)) {
      data.averageSpeedKilometersPerHour = formatNumberToTwoDecimals((stravaData.average_speed as number) * 3.6);
      data.averagePaceMinutesPer100Meters = formatNumberToTwoDecimals(100 / 60 / (stravaData.average_speed as number));
      data.averagePaceMinutesPerKilometer = formatNumberToTwoDecimals(1000 / 60 / (stravaData.average_speed as number));
    }

    // The max speed for swimming was found to be incorrect.
    if (!ActivityDtoFactory.SWIM_SPORT_TYPE_VALUES.includes(data.sportType)
      && isValidNonZeroNumber(stravaData.max_speed)) {
      data.maxSpeedKilometersPerHour = formatNumberToTwoDecimals((stravaData.max_speed as number) * 3.6);
    }

    if (isValidNonZeroNumber(stravaData.average_watts)) {
      data.averageWatts = formatNumberToTwoDecimals(stravaData.average_watts as number);
    }

    if (isValidNonZeroNumber(stravaData.max_watts)) {
      data.maxWatts = formatNumberToTwoDecimals(stravaData.max_watts as number);
    }

    if (isValidNonEmptyString((stravaData as StravaDetailedActivity).description)) {
      data.description = ((stravaData as StravaDetailedActivity).description as string).trim();
    }

    if (isValidNonZeroNumber((stravaData as StravaDetailedActivity).calories)) {
      data.calories = formatNumberToTwoDecimals((stravaData as StravaDetailedActivity).calories as number);
    }

    if (isValidNonZeroNumber(stravaData.average_heartrate)) {
      data.averageHeartRate = formatNumberToTwoDecimals(stravaData.average_heartrate as number);
    }

    if (isValidNonZeroNumber(stravaData.max_heartrate)) {
      data.maxHeartRate = formatNumberToTwoDecimals(stravaData.max_heartrate as number);
    }

    return data;
  }

  private calculateStats(activityDtos: ActivityDto[]): Stats {
    const stats: Stats = {};
    const keys: Array<keyof StatsPerSportType & keyof ActivityDto> = [
      'distanceMeters',
      'distanceKilometers',
      'movingTimeMinutes',
      'totalElevationGainMeters',
      'maxSpeedKilometersPerHour',
      'maxWatts',
      'calories',
      'maxHeartRate',
    ];
    const maxKeys: Array<typeof keys[number]> = [
      'maxSpeedKilometersPerHour',
      'maxWatts',
      'maxHeartRate',
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
          const statsPerSportType = stats[sportType] as StatsPerSportType;

          if (statsPerSportType[key]) {
            if (maxKeys.includes(key)) {
              statsPerSportType[key] = Math.max(statsPerSportType[key], activityDto[key]);
            } else {
              statsPerSportType[key] += activityDto[key];
            }
          } else {
            statsPerSportType[key] = activityDto[key];
          }
        }
      });
    });

    Object.values(stats).forEach((statsPerSportType) => {
      keys.forEach((key) => {
        if (statsPerSportType[key]) {
          statsPerSportType[key] = formatNumberToTwoDecimals(statsPerSportType[key]);
        }
      });
    });

    return stats;
  }
}
