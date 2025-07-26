import { OAuthClientModel, OAuthClientSchema } from '../models/oauthClientModel';

interface Options {
  oauthClientModel: OAuthClientModel;
}

export class OAuthClientRepository {
  private readonly oauthClientModel: OAuthClientModel;

  constructor({ oauthClientModel }: Options) {
    this.oauthClientModel = oauthClientModel;
  }

  public create(oauthClient: OAuthClientSchema) {
    return this.oauthClientModel.create(oauthClient);
  }

  public deleteOneById(id: string) {
    return this.oauthClientModel.deleteOne({ _id: id });
  }

  public findById(id: string) {
    return this.oauthClientModel.findById(id).lean();
  }
}
