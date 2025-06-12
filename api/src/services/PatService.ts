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
}
