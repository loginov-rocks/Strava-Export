import { OAuthClientData, OAuthClientModel } from '../models/oAuthClientModel';

interface Options {
  oAuthClientModel: OAuthClientModel;
}

export class OAuthClientRepository {
  private readonly oAuthClientModel: OAuthClientModel;

  constructor({ oAuthClientModel }: Options) {
    this.oAuthClientModel = oAuthClientModel;
  }

  public create(oAuthClientData: OAuthClientData) {
    return this.oAuthClientModel.create(oAuthClientData);
  }

  public deleteOneById(id: string) {
    return this.oAuthClientModel.deleteOne({ _id: id });
  }

  public findById(id: string) {
    return this.oAuthClientModel.findById(id);
  }
}
