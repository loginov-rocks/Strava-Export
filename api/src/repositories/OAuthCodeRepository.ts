import { OAuthCodeModel, OAuthCodeSchema } from '../models/oauthCodeModel';

interface Options {
  oauthCodeModel: OAuthCodeModel;
}

export class OAuthCodeRepository {
  private readonly oauthCodeModel: OAuthCodeModel;

  constructor({ oauthCodeModel }: Options) {
    this.oauthCodeModel = oauthCodeModel;
  }

  public create(oauthCode: OAuthCodeSchema) {
    return this.oauthCodeModel.create(oauthCode);
  }

  public deleteOneById(id: string) {
    return this.oauthCodeModel.deleteOne({ _id: id });
  }

  public findById(id: string) {
    return this.oauthCodeModel.findById(id).lean();
  }
}
