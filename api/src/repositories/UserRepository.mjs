export class UserRepository {
  constructor({ userModel }) {
    this.userModel = userModel;
  }

  create(user) {
    return this.userModel.create(user);
  }

  findOneByAthleteId(athleteId) {
    return this.userModel.findOne({ athleteId });
  }

  updateOneById(id, user) {
    return this.userModel.updateOne({ _id: id }, user);
  }
}
