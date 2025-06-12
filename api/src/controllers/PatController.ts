import { Response } from 'express';

import { PatDtoFactory } from '../dtoFactories/PatDtoFactory';
import { AuthenticatedRequest } from '../middlewares/TokenMiddleware';
import { PatService } from '../services/PatService';

interface Options {
  patDtoFactory: PatDtoFactory;
  patService: PatService;
}

export class PatController {
  private readonly patDtoFactory: PatDtoFactory;
  private readonly patService: PatService;

  constructor({ patDtoFactory, patService }: Options) {
    this.patDtoFactory = patDtoFactory;
    this.patService = patService;

    this.postPat = this.postPat.bind(this);
    this.getPats = this.getPats.bind(this);
    this.getPat = this.getPat.bind(this);
    this.deletePat = this.deletePat.bind(this);
  }

  public async postPat(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    if (!req.body || typeof req.body.name !== 'string') {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    const trimmedName = req.body.name.trim();

    if (!trimmedName || trimmedName.length === 0) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let createdPat;
    try {
      createdPat = await this.patService.createPat(userId, { name: trimmedName });
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.status(201).send(this.patDtoFactory.createCreatedJson(createdPat));
  }

  public async getPats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let pats;
    try {
      pats = await this.patService.getPatsByUserId(userId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.send(this.patDtoFactory.createJsonCollection(pats));
  }

  public async getPat(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const { patId } = req.params;

    if (!patId) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let pat;
    try {
      pat = await this.patService.getPat(patId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!pat || pat.userId !== userId) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    res.send(this.patDtoFactory.createJson(pat));
  }

  public async deletePat(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const { patId } = req.params;

    if (!patId) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let pat;
    try {
      pat = await this.patService.getPat(patId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!pat || pat.userId !== userId) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    try {
      await this.patService.deletePat(patId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.status(204).send();
  }
}
