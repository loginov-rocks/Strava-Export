import { OAuthStateData, OAuthStateModel } from '../models/oAuthStateModel';

interface Options {
  oAuthStateModel: OAuthStateModel;
}

export class OAuthStateRepository {
  private readonly oAuthStateModel: OAuthStateModel;

  constructor({ oAuthStateModel }: Options) {
    this.oAuthStateModel = oAuthStateModel;
  }

  public create(oAuthStateData: OAuthStateData) {
    return this.oAuthStateModel.create(oAuthStateData);
  }

  public deleteOneById(id: string) {
    return this.oAuthStateModel.deleteOne({ _id: id });
  }

  public findById(id: string) {
    return this.oAuthStateModel.findById(id);
  }
}
