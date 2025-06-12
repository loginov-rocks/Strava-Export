import { createHash, randomBytes } from 'crypto';

import { PatDocument, PatModel } from '../models/patModel';

interface Options {
  patModel: PatModel;
}

interface CreateParams {
  userId: string;
  name: string;
}

export interface CreatedPatDocument extends PatDocument {
  token: string;
}

export class PatRepository {
  private readonly patModel: PatModel;

  constructor({ patModel }: Options) {
    this.patModel = patModel;
  }

  public async create(patParams: CreateParams) {
    const { token, hash, display } = this.generateToken();

    const pat = await this.patModel.create({
      ...patParams,
      hash,
      display,
    });

    return {
      ...pat,
      token,
    };
  }

  public deleteOneById(id: string) {
    return this.patModel.deleteOne({ _id: id });
  }

  public findById(id: string) {
    return this.patModel.findById(id).lean();
  }

  public findByUserId(userId: string) {
    return this.patModel.find({ userId }).sort({ 'name': 1 }).lean();
  }

  // TODO: Revisit.
  private generateToken() {
    const randomPart = randomBytes(32);
    const token = `pat_${randomPart}`;
    const hash = createHash('sha256').update(token).digest('hex');
    const display = token.substring(0, 12);

    return { token, hash, display };
  }
}
