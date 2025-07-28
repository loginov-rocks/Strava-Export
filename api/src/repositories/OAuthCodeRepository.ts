import { OAuthCodeData, OAuthCodeModel } from '../models/oAuthCodeModel';

interface Options {
  oAuthCodeModel: OAuthCodeModel;
}

export class OAuthCodeRepository {
  private readonly oAuthCodeModel: OAuthCodeModel;

  constructor({ oAuthCodeModel }: Options) {
    this.oAuthCodeModel = oAuthCodeModel;
  }

  public create(oAuthCodeData: OAuthCodeData) {
    return this.oAuthCodeModel.create(oAuthCodeData);
  }

  public deleteOneById(id: string) {
    return this.oAuthCodeModel.deleteOne({ _id: id });
  }

  public findById(id: string) {
    return this.oAuthCodeModel.findById(id);
  }
}
