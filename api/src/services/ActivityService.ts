import { ActivityRepository } from '../repositories/ActivityRepository';

interface Options {
  activityRepository: ActivityRepository;
}

export class ActivityService {
  private readonly activityRepository: ActivityRepository;

  constructor({ activityRepository }: Options) {
    this.activityRepository = activityRepository;
  }

  public deleteActivitiesByUserId(userId: string) {
    return this.activityRepository.deleteByUserId(userId);
  }

  public getActivitiesByUserId(userId: string, filter?: Parameters<typeof this.activityRepository.findByUserId>[1]) {
    return this.activityRepository.findByUserId(userId, filter);
  }

  public getActivity(activityId: string) {
    return this.activityRepository.findById(activityId);
  }

  public getLastActivityByUserId(
    userId: string,
    filter?: Parameters<typeof this.activityRepository.findLastByUserId>[1],
  ) {
    return this.activityRepository.findLastByUserId(userId, filter);
  }

  public getFilterValues() {
    return this.activityRepository.getFilterValues();
  }
}
