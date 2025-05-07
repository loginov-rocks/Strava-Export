export class UserRepository {
  constructor({ userModel }) {
    this.userModel = userModel;
  }

  createOrUpdateByStravaAthleteId(stravaAthleteId, user) {
    return this.userModel.findOneAndUpdate({ stravaAthleteId }, user, { new: true, upsert: true }).lean();
  }

  findById(id) {
    return this.userModel.findById(id).lean();
  }
}
