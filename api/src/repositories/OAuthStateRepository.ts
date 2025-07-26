import { OAuthStateModel, OAuthStateSchema } from '../models/oauthStateModel';

interface Options {
  oauthStateModel: OAuthStateModel;
}

export class OAuthStateRepository {
  private readonly oauthStateModel: OAuthStateModel;

  constructor({ oauthStateModel }: Options) {
    this.oauthStateModel = oauthStateModel;
  }

  public create(oauthState: OAuthStateSchema) {
    return this.oauthStateModel.create(oauthState);
  }

  public deleteOneById(id: string) {
    return this.oauthStateModel.deleteOne({ _id: id });
  }

  public findById(id: string) {
    return this.oauthStateModel.findById(id).lean();
  }
}
