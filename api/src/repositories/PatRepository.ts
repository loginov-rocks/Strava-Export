import { PatData, PatDocument, PatModel } from '../models/patModel';
import { createSha256Hash, generateRandomAlphaNumericString } from '../utils/createHash';

import { BaseRepository } from './BaseRepository';

export interface CreatePatData {
  userId: string;
  name: string;
}

interface Options {
  displayLength: number;
  patModel: PatModel;
  tokenPrefix: string;
  tokenRandomLength: number;
}

export class PatRepository extends BaseRepository<PatData, PatDocument> {
  private readonly displayLength: number;
  private readonly tokenPrefix: string;
  private readonly tokenRandomLength: number;

  constructor({ displayLength, patModel, tokenPrefix, tokenRandomLength }: Options) {
    super({ model: patModel });

    this.displayLength = displayLength;
    this.tokenPrefix = tokenPrefix;
    this.tokenRandomLength = tokenRandomLength;
  }

  public async createPat(createPatData: CreatePatData) {
    const { token, hash, display } = this.generateToken();

    const pat = await this.create({
      ...createPatData,
      hash,
      display,
    });

    return { pat, token };
  }

  public findByTokenAndUpdateLastUsedAt(token: string) {
    if (!token.startsWith(this.tokenPrefix)) {
      return null;
    }

    const hash = createSha256Hash(token);

    return this.model.findOneAndUpdate({ hash }, { lastUsedAt: new Date() }, { new: true });
  }

  public findByUserId(userId: string) {
    return this.model.find({ userId }).sort({ 'name': 1 });
  }

  private generateToken() {
    const randomPart = generateRandomAlphaNumericString(this.tokenRandomLength);
    const token = `${this.tokenPrefix}${randomPart}`;
    const hash = createSha256Hash(token);
    const display = token.substring(0, this.displayLength);

    return { token, hash, display };
  }
}
