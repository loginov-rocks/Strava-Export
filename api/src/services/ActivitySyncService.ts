import { StravaActivity, StravaApiClient } from '../apiClients/StravaApiClient';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { StravaTokenService } from './StravaTokenService';

interface Options {
  activityRepository: ActivityRepository;
  stravaApiClient: StravaApiClient;
  stravaTokenService: StravaTokenService;
}

export class ActivitySyncService {
  private readonly activityRepository: ActivityRepository;
  private readonly stravaApiClient: StravaApiClient;
  private readonly stravaTokenService: StravaTokenService;

  constructor({ activityRepository, stravaApiClient, stravaTokenService }: Options) {
    this.activityRepository = activityRepository;
    this.stravaApiClient = stravaApiClient;
    this.stravaTokenService = stravaTokenService;
  }

  public async processPaginatedActivities(userId: string) {
    const perPage = 30;

    let page = 1;
    let hasMorePages = true;

    let detailsProcessedCount = 0;
    let detailsUpdatedCount = 0;
    let existingCount = 0;
    let insertedCount = 0;
    let noDetailsCount = 0;
    let nonExistingCount = 0;
    let processedCount = 0;

    while (hasMorePages) {
      const accessToken = await this.stravaTokenService.getAccessToken(userId);
      const activitiesPage = await this.stravaApiClient.getActivities(accessToken, page, perPage);
      const pageResults = await this.processActivitiesPage(userId, activitiesPage);

      existingCount += pageResults.existingCount;
      insertedCount += pageResults.insertedCount;
      noDetailsCount += pageResults.noDetailsCount;
      nonExistingCount += pageResults.nonExistingCount;
      processedCount += pageResults.processedCount;

      if (pageResults.noDetailsIds.length > 0) {
        const detailsResults = await this.processActivitiesDetails(userId, pageResults.noDetailsIds);

        detailsProcessedCount += detailsResults.processedCount;
        detailsUpdatedCount += detailsResults.updatedCount;
      }

      if (activitiesPage.length < perPage) {
        hasMorePages = false;
        break;
      }

      page++;
    }

    return {
      detailsProcessedCount,
      detailsUpdatedCount,
      existingCount,
      insertedCount,
      noDetailsCount,
      nonExistingCount,
      pagesCount: page,
      perPageCount: perPage,
      processedCount,
    };
  }

  private async processActivitiesPage(userId: string, activitiesPage: StravaActivity[]) {
    // Create an array of IDs for the page of activities obtained from Strava.
    const ids = activitiesPage.map(({ id }) => id);

    // Get all existing activities from the database matching any of these IDs.
    const existing = await this.activityRepository.findByStravaActivityIds(ids);

    // Create an array of IDs for existing activities from the database.
    const existingIds = existing.map(({ stravaActivityId }) => stravaActivityId);
    // Filter the page of activities obtained from Strava, leaving only those that are not in the database.
    const nonExisting = activitiesPage.filter(({ id }) => existingIds.indexOf(id.toString()) < 0);
    let insertedCount = 0;

    if (nonExisting.length > 0) {
      // Convert the page of activities obtained from Strava to the model expected by the database and insert them all
      // at once.
      const output = await this.activityRepository.insertMany(nonExisting.map((activity) => ({
        userId,
        hasDetails: false,
        stravaActivityId: activity.id,
        stravaData: activity,
      })));

      insertedCount = output.length;
    }

    // Create an array of IDs for existing activities from the database that do not have details. Done here as a kind
    // of optimization since we already have this data received from the database.
    const noDetailsIds = existing.filter(({ hasDetails }) => !hasDetails)
      .map(({ stravaActivityId }) => stravaActivityId);

    // Add IDs from the page of activities obtained from Strava that were not in the database, since they have no
    // details yet (just inserted).
    if (nonExisting.length > 0) {
      noDetailsIds.push(...nonExisting.map(({ id }) => id));
    }

    return {
      existingCount: existingIds.length,
      insertedCount,
      noDetailsCount: noDetailsIds.length,
      noDetailsIds,
      nonExistingCount: nonExisting.length,
      processedCount: activitiesPage.length,
    };
  }

  private async processActivitiesDetails(userId: string, stravaActivitiesIds: string[]) {
    let updatedCount = 0;

    for (const stravaActivityId of stravaActivitiesIds) {
      const accessToken = await this.stravaTokenService.getAccessToken(userId);
      const activityDetails = await this.stravaApiClient.getActivity(accessToken, stravaActivityId);

      const output = await this.activityRepository.updateOneByStravaActivityId(
        stravaActivityId,
        {
          hasDetails: true,
          stravaData: activityDetails,
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
