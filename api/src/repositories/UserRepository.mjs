export class UserRepository {
  constructor({ userModel }) {
    this.userModel = userModel;
  }

  createOrUpdateByAthleteId(athleteId, user) {
    return this.userModel.findOneAndUpdate({ athleteId }, user, { new: true, upsert: true });
  }
}
