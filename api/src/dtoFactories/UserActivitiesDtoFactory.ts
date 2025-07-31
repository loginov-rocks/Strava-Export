import { StravaSportType } from '../apiClients/StravaApiClient';
import { ActivityDocument } from '../models/activityModel';
import { formatLocalDateStringWithTimezone } from '../utils/format';
import { isValidNonEmptyString, isValidNonZeroNumber } from '../utils/isValid';

interface UserActivitiesByDate {
  date: string;
  activities: StravaSportType[];
}

interface UserActivitiesDto {
  userActivities: UserActivitiesByDate[];
}

// TODO: Draft.
export class UserActivitiesDtoFactory {
  public createJson(activities: ActivityDocument[]): UserActivitiesDto {
    const activitiesWithDates = this.transformActivitiesWithDate(activities);

    const groupedByDate = activitiesWithDates.reduce((acc, activity) => {
      if (!acc[activity.date]) {
        acc[activity.date] = [];
      }
      acc[activity.date].push(activity);

      return acc;
    }, {} as Record<string, typeof activitiesWithDates>);

    const userActivities: UserActivitiesByDate[] = Object.entries(groupedByDate)
      .map(([date, dayActivities]) => ({
        date,
        activities: dayActivities
          .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
          .map(activity => activity.sportType)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      userActivities,
    };
  }

  private transformActivitiesWithDate(activities: ActivityDocument[]) {
    return activities.map((activity) => {
      const { stravaData } = activity;

      let startDateTime = stravaData.start_date;

      if (isValidNonZeroNumber(stravaData.utc_offset) && isValidNonEmptyString(stravaData.start_date_local)) {
        startDateTime = formatLocalDateStringWithTimezone(stravaData.start_date_local as string,
          stravaData.utc_offset as number);
      }

      const date = startDateTime.split('T')[0];

      return {
        date,
        sportType: stravaData.sport_type,
        startDateTime,
      };
    });
  }
}
