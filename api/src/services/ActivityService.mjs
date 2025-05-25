export class ActivityService {
  constructor({ activityRepository }) {
    this.activityRepository = activityRepository;
  }

  getActivitiesByUserId(userId) {
    return this.activityRepository.findByUserId(userId);
  }

  getActivity(activityId) {
    return this.activityRepository.findById(activityId);
  }

  getLastActivityByUserId(userId) {
    return this.activityRepository.findLastByUserId(userId);
  }
}
