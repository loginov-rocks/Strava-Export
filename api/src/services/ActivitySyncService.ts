import { StravaApiClient, StravaSummaryActivity } from '../apiClients/StravaApiClient';
import { SyncJobCompletedResult, SyncJobParams } from '../models/syncJobModel';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { isValidDateStringFromLastDays } from '../utils/isValid';

import { UserService } from './UserService';

interface Options {
  activityRepository: ActivityRepository;
  stravaApiClient: StravaApiClient;
  userService: UserService;
}

export class ActivitySyncService {
  private readonly activityRepository: ActivityRepository;
  private readonly stravaApiClient: StravaApiClient;
  private readonly userService: UserService;

  constructor({ activityRepository, stravaApiClient, userService }: Options) {
    this.activityRepository = activityRepository;
    this.stravaApiClient = stravaApiClient;
    this.userService = userService;
  }

  public async processPaginatedActivities(userId: string, params?: SyncJobParams): Promise<SyncJobCompletedResult> {
    const perPage = 100;

    let page = 1;
    let hasMorePages = true;

    let processedCount = 0;
    let existingCount = 0;
    let nonExistingCount = 0;
    let insertedCount = 0;
    let noDetailsCount = 0;
    let refreshDetailsCount = 0;
    let detailsProcessedCount = 0;
    let detailsUpdatedCount = 0;

    while (hasMorePages) {
      const accessToken = await this.userService.getStravaAccessToken(userId);
      const stravaSummaryActivities = await this.stravaApiClient.getActivities(accessToken, page, perPage);
      const pageResults = await this.processStravaSummaryActivities(userId, stravaSummaryActivities, params);

      processedCount += pageResults.processedCount;
      existingCount += pageResults.existingCount;
      nonExistingCount += pageResults.nonExistingCount;
      insertedCount += pageResults.insertedCount;
      noDetailsCount += pageResults.noDetailsCount;
      refreshDetailsCount += pageResults.refreshDetailsCount;

      if (pageResults.noDetailsIds.length > 0 || pageResults.refreshDetailsIds.length > 0) {
        const detailsResults = await this.processActivitiesDetails(userId, [
          // IDs with no details go first to first fetch activities with no details at all in case further requests
          // fail.
          ...pageResults.noDetailsIds,
          ...pageResults.refreshDetailsIds,
        ]);

        detailsProcessedCount += detailsResults.processedCount;
        detailsUpdatedCount += detailsResults.updatedCount;
      }

      if (stravaSummaryActivities.length < perPage) {
        hasMorePages = false;
        break;
      }

      page++;
    }

    return {
      pagesCount: page,
      perPageCount: perPage,
      processedCount,
      existingCount,
      nonExistingCount,
      insertedCount,
      noDetailsCount,
      refreshDetailsCount,
      detailsProcessedCount,
      detailsUpdatedCount,
    };
  }

  private async processStravaSummaryActivities(
    userId: string,
    stravaSummaryActivities: StravaSummaryActivity[],
    params?: SyncJobParams,
  ) {
    // Create an array of IDs for the page of activities obtained from Strava.
    const stravaIds = stravaSummaryActivities.map(({ id }) => id.toString());

    // Get all existing activities from the database matching any of these IDs.
    const existingActivities = await this.activityRepository.findByStravaActivityIds(stravaIds);

    // Create an array of IDs for existing activities from the database.
    const existingStravaIds = existingActivities.map(({ stravaActivityId }) => stravaActivityId);
    // Filter the page of activities obtained from Strava, leaving only those that are not in the database.
    const nonExistingStravaSummaryActivities = stravaSummaryActivities.filter(({ id }) => (
      existingStravaIds.indexOf(id.toString()) < 0
    ));
    let insertedCount = 0;

    if (nonExistingStravaSummaryActivities.length > 0) {
      // Convert the page of activities obtained from Strava to the model expected by the database and insert them all
      // at once.
      const output = await this.activityRepository.createMany(
        nonExistingStravaSummaryActivities.map((stravaSummaryActivity) => ({
          userId,
          hasDetails: false,
          stravaActivityId: stravaSummaryActivity.id.toString(),
          stravaData: stravaSummaryActivity,
        })),
      );

      insertedCount = output.length;
    }

    // Create an array of IDs for existing activities from the database that do not have details. Done here as a kind
    // of optimization since we already have this data received from the database.
    const noDetailsStravaIds = existingActivities.filter(({ hasDetails }) => !hasDetails)
      .map(({ stravaActivityId }) => stravaActivityId);

    // Add IDs from the page of activities obtained from Strava that were not in the database, since they have no
    // details yet (just inserted).
    if (nonExistingStravaSummaryActivities.length > 0) {
      noDetailsStravaIds.push(...nonExistingStravaSummaryActivities.map(({ id }) => id.toString()));
    }

    let refreshDetailsStravaIds: string[] = [];
    if (params && params.refreshLastDays) {
      refreshDetailsStravaIds = existingActivities.filter(({ hasDetails, stravaData }) => {
        // Skip activities that have no details, since they already included in the `noDetailsStravaIds`.
        if (!hasDetails) {
          return false;
        }

        // Check if activity start date within the last N days requested to refresh.
        return isValidDateStringFromLastDays(stravaData.start_date, params.refreshLastDays as number);
      })
        .map(({ stravaActivityId }) => stravaActivityId);
    }

    return {
      processedCount: stravaSummaryActivities.length,
      existingCount: existingStravaIds.length,
      nonExistingCount: nonExistingStravaSummaryActivities.length,
      insertedCount,
      noDetailsCount: noDetailsStravaIds.length,
      noDetailsIds: noDetailsStravaIds,
      refreshDetailsCount: refreshDetailsStravaIds.length,
      refreshDetailsIds: refreshDetailsStravaIds,
    };
  }

  /**
   * Updates details for activities with Strava IDs passed.
   */
  private async processActivitiesDetails(userId: string, stravaActivitiesIds: string[]) {
    let updatedCount = 0;

    for (const stravaActivityId of stravaActivitiesIds) {
      const accessToken = await this.userService.getStravaAccessToken(userId);
      const stravaDetailedActivity = await this.stravaApiClient.getActivity(accessToken, stravaActivityId);

      const output = await this.activityRepository.updateByStravaActivityId(
        stravaActivityId,
        {
          hasDetails: true,
          stravaData: stravaDetailedActivity,
        },
      );

      updatedCount += output.modifiedCount;
    }

    return {
      processedCount: stravaActivitiesIds.length,
      updatedCount,
    };
  }
}
