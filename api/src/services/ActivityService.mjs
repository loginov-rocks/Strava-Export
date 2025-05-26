export class ActivityService {
  constructor({ activityRepository }) {
    this.activityRepository = activityRepository;
  }

  getActivitiesByUserId(userId, filter) {
    return this.activityRepository.findByUserId(userId, filter);
  }

  getActivity(activityId) {
    return this.activityRepository.findById(activityId);
  }

  getLastActivityByUserId(userId, filter) {
    return this.activityRepository.findLastByUserId(userId, filter);
  }

  getFilterScheme() {
    return this.activityRepository.getFilterScheme();
  }
}
