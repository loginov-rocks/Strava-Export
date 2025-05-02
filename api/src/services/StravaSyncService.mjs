import { Activity } from '../models/Activity.mjs';
import { StravaSyncJob } from '../models/StravaSyncJob.mjs';

export class StravaSyncService {
  constructor({ stravaApiClient }) {
    this.stravaApiClient = stravaApiClient;
  }

  async createJob({ athleteId, accessToken }) {
    const job = await StravaSyncJob.create({
      athleteId,
      accessToken,
    });

    return {
      athleteId: job.athleteId,
      id: job.id,
    };
  }

  async processPaginatedActivities(accessToken) {
    const perPage = 30;

    let page = 1;
    let hasMorePages = true;

    let existingCount = 0;
    let insertedCount = 0;
    let nonExistingCount = 0;
    let processedCount = 0;

    while (hasMorePages) {
      const paginatedActivities = await this.stravaApiClient.getActivities(accessToken, page, perPage);
      const result = await this.processActivitiesPage(paginatedActivities);

      existingCount += result.existingCount;
      insertedCount += result.insertedCount;
      nonExistingCount += result.nonExistingCount;
      processedCount += result.processedCount;

      if (paginatedActivities.length < perPage) {
        hasMorePages = false;
        break;
      }

      page++;
    }

    return {
      existingCount,
      insertedCount,
      nonExistingCount,
      pagesCount: page,
      perPageCount: perPage,
      processedCount,
    };
  }

  async processActivitiesPage(activities) {
    const activitiesIds = activities.map(({ id }) => id);

    const existingActivities = await Activity.find({
      activityId: { $in: activitiesIds }
    });

    const existingActivitiesIds = existingActivities.map(({ activityId }) => activityId);
    const nonExistingActivities = activities.filter(({ id }) => existingActivitiesIds.indexOf(id.toString()) < 0);
    let insertedCount = 0;

    if (nonExistingActivities.length > 0) {
      const output = await Activity.insertMany(nonExistingActivities.map((activity) => ({
        ...activity,
        activityId: activity.id,
        athleteId: activity.athlete.id,
        hasDetails: false,
      })));

      insertedCount = output.length;
    }

    return {
      existingCount: existingActivitiesIds.length,
      insertedCount,
      nonExistingCount: nonExistingActivities.length,
      processedCount: activities.length,
    };
  }
}
