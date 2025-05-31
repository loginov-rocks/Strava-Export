import { ActivityRepository, Filter } from '../repositories/ActivityRepository';

interface Options {
  activityRepository: ActivityRepository;
}

export class ActivityService {
  private readonly activityRepository: ActivityRepository;

  constructor({ activityRepository }: Options) {
    this.activityRepository = activityRepository;
  }

  public getActivitiesByUserId(userId: string, filter?: Filter) {
    return this.activityRepository.findByUserId(userId, filter);
  }

  public getActivity(activityId: string) {
    return this.activityRepository.findById(activityId);
  }

  public getLastActivityByUserId(userId: string, filter?: Filter) {
    return this.activityRepository.findLastByUserId(userId, filter);
  }

  public getFilterScheme() {
    return this.activityRepository.getFilterScheme();
  }
}
