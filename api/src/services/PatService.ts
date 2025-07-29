import { CreatePatData, PatRepository } from '../repositories/PatRepository';

interface Options {
  patRepository: PatRepository;
}

export class PatService {
  private readonly patRepository: PatRepository;

  constructor({ patRepository }: Options) {
    this.patRepository = patRepository;
  }

  public createPat(createPatData: CreatePatData) {
    return this.patRepository.createPat(createPatData);
  }

  public getPat(patId: string) {
    return this.patRepository.findById(patId);
  }

  public getPatsByUserId(userId: string) {
    return this.patRepository.findByUserId(userId);
  }

  public deletePat(patId: string) {
    return this.patRepository.deleteById(patId);
  }

  public async verifyPat(token: string) {
    const pat = await this.patRepository.findByTokenAndUpdateLastUsedAt(token);

    if (!pat) {
      throw new Error('PAT not found');
    }

    return { userId: pat.userId };
  }
}

