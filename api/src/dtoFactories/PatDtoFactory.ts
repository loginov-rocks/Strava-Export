import { PatDocument } from '../models/patModel';
import { CreatedPatDocument } from '../repositories/PatRepository';

interface PatDto {
  id: string;
  userId: string;
  name: string;
  display: string;
  lastUsedAt: string | null;
}

interface CreatedPatDto extends PatDto {
  token: string;
}

interface PatsCollectionDto {
  patsCount: number;
  pats: PatDto[];
}

export class PatDtoFactory {
  public createJson(pat: PatDocument): PatDto {
    return {
      id: pat._id.toString(),
      userId: pat.userId,
      name: pat.name,
      display: pat.display,
      lastUsedAt: pat.lastUsedAt ? pat.lastUsedAt.toISOString() : null,
    };
  }

  public createCreatedJson(createdPat: CreatedPatDocument): CreatedPatDto {
    const patDto = this.createJson(createdPat);

    return {
      ...patDto,
      token: createdPat.token,
    };
  }

  public createJsonCollection(pats: PatDocument[]): PatsCollectionDto {
    const patDtos = pats.map((pat) => this.createJson(pat));

    return {
      patsCount: patDtos.length,
      pats: patDtos,
    };
  }
}
