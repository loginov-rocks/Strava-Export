import { Response } from 'express';

import { AuthenticatedRequest } from '../middlewares/TokenMiddleware';

export class PatController {
  constructor() {
    this.postPat = this.postPat.bind(this);
    this.getPats = this.getPats.bind(this);
    this.deletePat = this.deletePat.bind(this);
  }

  public postPat(req: AuthenticatedRequest, res: Response): void {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    res.status(204).send();
  }

  public getPats(req: AuthenticatedRequest, res: Response): void {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    res.status(204).send();
  }

  public deletePat(req: AuthenticatedRequest, res: Response): void {
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

    res.status(200).send({ patId });
  }
}
