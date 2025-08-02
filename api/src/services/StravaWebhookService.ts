import { StravaApiClient } from '../apiClients/StravaApiClient';
import { ActivityRepository } from '../repositories/ActivityRepository';

import { UserService } from './UserService';

interface Options {
  activityRepository: ActivityRepository;
  stravaApiClient: StravaApiClient;
  userService: UserService;
}

// @see https://developers.strava.com/docs/webhooks/#event-data
interface StravaEvent {
  object_type: 'activity' | 'athlete';
  object_id: number;
  aspect_type: 'create' | 'update' | 'delete';
  updates: Record<string, unknown>;
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

// TODO: Draft.
export class StravaWebhookService {
  private readonly activityRepository: ActivityRepository;
  private readonly stravaApiClient: StravaApiClient;
  private readonly userService: UserService;

  constructor({ activityRepository, stravaApiClient, userService }: Options) {
    this.activityRepository = activityRepository;
    this.stravaApiClient = stravaApiClient;
    this.userService = userService;
  }

  public async processEvent(event: StravaEvent): Promise<void> {
    if (event.object_type !== 'activity') {
      console.warn(`Strava event with unsupported object type "${event.object_type}" received`, event);
      return;
    }

    const stravaAthleteId = event.owner_id.toString();
    const stravaActivityId = event.object_id.toString();

    let user;
    try {
      user = await this.userService.getUserByStravaAthleteId(stravaAthleteId);
    } catch (error) {
      console.error(error);
      return;
    }

    if (!user) {
      console.warn(`User with Strava athlete ID "${stravaAthleteId}" not found`);
      return;
    }

    if (event.aspect_type === 'create' || event.aspect_type === 'update') {
      try {
        await this.processActivityCreateOrUpdate(user.id, stravaActivityId);
      } catch (error) {
        console.error(error);
      }

      return;
    }

    if (event.aspect_type === 'delete') {
      try {
        await this.processActivityDelete(user.id, stravaActivityId);
      } catch (error) {
        console.error(error);
      }

      return;
    }

    console.warn(`Strava event with unexpected aspect type "${event.aspect_type}" received`, event);
  }

  private async processActivityCreateOrUpdate(userId: string, stravaActivityId: string) {
    const activity = await this.activityRepository.findByStravaActivityId(stravaActivityId);

    if (activity && activity.userId !== userId) {
      console.warn(`Activity ID "${activity.id}" owner user ID mismatch: "${userId}" received, but stored with "${activity.userId}"`);
      return;
    }

    const accessToken = await this.userService.getStravaAccessToken(userId);
    const stravaDetailedActivity = await this.stravaApiClient.getActivity(accessToken, stravaActivityId);

    if (activity) {
      return this.activityRepository.updateByStravaActivityId(
        stravaActivityId,
        {
          stravaData: stravaDetailedActivity,
          hasDetails: true,
        },
      );
    }

    return this.activityRepository.create({
      stravaActivityId,
      userId,
      stravaData: stravaDetailedActivity,
      hasDetails: true,
    });
  }

  private async processActivityDelete(userId: string, stravaActivityId: string) {
    const activity = await this.activityRepository.findByStravaActivityId(stravaActivityId);

    if (!activity) {
      console.warn(`Activity with Strava ID "${stravaActivityId}" not found`);
      return;
    }

    if (activity.userId !== userId) {
      console.warn(`Activity ID "${activity.id}" owner user ID mismatch: "${userId}" received, but stored with "${activity.userId}"`);
      return;
    }

    return this.activityRepository.deleteById(activity.id);
  }
}
