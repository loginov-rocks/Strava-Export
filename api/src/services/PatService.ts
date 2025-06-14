import { PatRepository } from '../repositories/PatRepository';

interface Options {
  patRepository: PatRepository;
}

interface CreatePatParams {
  name: string;
}

export class PatService {
  private readonly patRepository: PatRepository;

  constructor({ patRepository }: Options) {
    this.patRepository = patRepository;
  }

  public createPat(userId: string, { name }: CreatePatParams) {
    return this.patRepository.create({
      userId,
      name,
    });
  }

  public getPat(patId: string) {
    return this.patRepository.findById(patId);
  }

  public getPatsByUserId(userId: string) {
    return this.patRepository.findByUserId(userId);
  }

  public deletePat(patId: string) {
    return this.patRepository.deleteOneById(patId);
  }

  public async verifyPat(token: string) {
    const pat = await this.patRepository.findOneByTokenAndUpdateLastUsedAt(token);

    if (!pat) {
      throw new Error('PAT not found');
    }

    return { userId: pat.userId };
  }
}

