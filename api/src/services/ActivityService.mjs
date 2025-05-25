export class ActivityService {
  constructor({ activityRepository }) {
    this.activityRepository = activityRepository;
  }

  getActivitiesByUserId(userId) {
    return this.activityRepository.findByUserId(userId);
  }
}
