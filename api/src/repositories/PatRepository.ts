import { createHash, randomInt } from 'crypto';

import { PatModel } from '../models/patModel';

interface Options {
  displayLength: number;
  patModel: PatModel;
  tokenPrefix: string;
  tokenRandomLength: number;
}

interface CreateParams {
  userId: string;
  name: string;
}

export class PatRepository {
  private readonly displayLength: number;
  private readonly patModel: PatModel;
  private readonly tokenPrefix: string;
  private readonly tokenRandomLength: number;

  constructor({ displayLength, patModel, tokenPrefix, tokenRandomLength }: Options) {
    this.displayLength = displayLength;
    this.patModel = patModel;
    this.tokenPrefix = tokenPrefix;
    this.tokenRandomLength = tokenRandomLength;
  }

  public async create(patParams: CreateParams) {
    const { token, hash, display } = this.generateToken();

    const pat = await this.patModel.create({
      ...patParams,
      hash,
      display,
    });

    return {
      pat,
      token,
    };
  }

  public deleteOneById(id: string) {
    return this.patModel.deleteOne({ _id: id });
  }

  public findById(id: string) {
    return this.patModel.findById(id).lean();
  }

  public findOneByTokenAndUpdateLastUsedAt(token: string) {
    if (!token.startsWith(this.tokenPrefix)) {
      return null;
    }

    const hash = PatRepository.generateTokenHash(token);

    return this.patModel.findOneAndUpdate({ hash }, { lastUsedAt: new Date() }, { new: true }).lean();
  }

  public findByUserId(userId: string) {
    return this.patModel.find({ userId }).sort({ 'name': 1 }).lean();
  }

  private generateToken() {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomPart = Array.from({ length: this.tokenRandomLength }, () => (
      charset[randomInt(0, charset.length)]
    )).join('');
    const token = `${this.tokenPrefix}${randomPart}`;
    const hash = PatRepository.generateTokenHash(token);
    const display = token.substring(0, this.displayLength);

    return { token, hash, display };
  }

  private static generateTokenHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
