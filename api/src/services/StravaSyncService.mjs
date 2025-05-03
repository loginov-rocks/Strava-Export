export class StravaSyncService {
  constructor({ activityRepository, stravaApiClient, stravaSyncJobRepository }) {
    this.activityRepository = activityRepository;
    this.stravaApiClient = stravaApiClient;
    this.stravaSyncJobRepository = stravaSyncJobRepository;
  }

  async createJob({ athleteId, accessToken }) {
    const job = await this.stravaSyncJobRepository.create({
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

    let detailsProcessedCount = 0;
    let detailsUpdatedCount = 0;
    let existingCount = 0;
    let insertedCount = 0;
    let noDetailsCount = 0;
    let nonExistingCount = 0;
    let processedCount = 0;

    while (hasMorePages) {
      const activitiesPage = await this.stravaApiClient.getActivities(accessToken, page, perPage);
      const pageResults = await this.processActivitiesPage(activitiesPage);

      existingCount += pageResults.existingCount;
      insertedCount += pageResults.insertedCount;
      noDetailsCount += pageResults.noDetailsCount;
      nonExistingCount += pageResults.nonExistingCount;
      processedCount += pageResults.processedCount;

      if (pageResults.noDetailsIds.length > 0) {
        const detailsResults = await this.processActivitiesDetails(accessToken, pageResults.noDetailsIds);

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

  async processActivitiesPage(activitiesPage) {
    // Create an array of IDs for the page of activities obtained from Strava.
    const ids = activitiesPage.map(({ id }) => id);

    // Get all existing activities from the database matching any of these IDs.
    const existing = await this.activityRepository.findByActivityIds(ids);

    // Create an array of IDs for existing activities from the database.
    const existingIds = existing.map(({ activityId }) => activityId);
    // Filter the page of activities obtained from Strava, leaving only those that are not in the database.
    const nonExisting = activitiesPage.filter(({ id }) => existingIds.indexOf(id.toString()) < 0);
    let insertedCount = 0;

    if (nonExisting.length > 0) {
      // Convert the page of activities obtained from Strava to the model expected by the database and insert them all
      // at once.
      const output = await this.activityRepository.insertMany(nonExisting.map((activity) => ({
        ...activity,
        activityId: activity.id,
        athleteId: activity.athlete.id,
        hasDetails: false,
      })));

      insertedCount = output.length;
    }

    // Create an array of IDs for existing activities from the database that do not have details. Done here as a kind
    // of optimization since we already have this data received from the database.
    const noDetailsIds = existing.filter(({ hasDetails }) => !hasDetails).map(({ activityId }) => activityId);

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

  async processActivitiesDetails(accessToken, activitiesIds) {
    let updatedCount = 0;

    for (const activityId of activitiesIds) {
      const activityDetails = await this.stravaApiClient.getActivity(accessToken, activityId);

      const output = await this.activityRepository.updateOneByActivityId(
        activityId,
        {
          ...activityDetails,
          // Making sure the required fields are not overridden by other data coming from Strava while keeping it up to
          // date.
          activityId: activityDetails.id,
          athleteId: activityDetails.athlete.id,
          hasDetails: true,
        },
      );

      updatedCount += output.modifiedCount;
    }

    return {
      processedCount: activitiesIds.length,
      updatedCount,
    };
  }
}
