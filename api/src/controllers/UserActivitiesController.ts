import { Response } from 'express';

import { UserActivitiesDtoFactory } from '../dtoFactories/UserActivitiesDtoFactory';
import { WebAuthenticatedRequest } from '../middlewares/WebAuthMiddleware';
import { ActivityService } from '../services/ActivityService';
import { UserService } from '../services/UserService';

interface Options {
  activityService: ActivityService;
  userActivitiesDtoFactory: UserActivitiesDtoFactory;
  userService: UserService;
}

export class UserActivitiesController {
  private readonly activityService: ActivityService;
  private readonly userActivitiesDtoFactory: UserActivitiesDtoFactory;
  private readonly userService: UserService;

  constructor({ activityService, userActivitiesDtoFactory, userService }: Options) {
    this.activityService = activityService;
    this.userActivitiesDtoFactory = userActivitiesDtoFactory;
    this.userService = userService;

    this.getUserActivities = this.getUserActivities.bind(this);
  }

  public async getUserActivities(req: WebAuthenticatedRequest, res: Response): Promise<void> {
    const { userId: authenticatedUserId } = req;
    const { stravaAthleteId } = req.params;

    if (!stravaAthleteId) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let user;
    try {
      user = await this.userService.getUserByStravaAthleteId(stravaAthleteId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!user || (!user.isPublic && !authenticatedUserId) || (!user.isPublic && user.id !== authenticatedUserId)) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    let activities;
    try {
      activities = await this.activityService.getActivitiesByUserId(user.id);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.send(this.userActivitiesDtoFactory.createJson(activities));
  }
}
