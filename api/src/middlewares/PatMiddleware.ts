import { NextFunction, Request, Response } from 'express';

import { PatService } from '../services/PatService';

export interface PatAuthenticatedRequest extends Request {
  userId?: string;
}

interface Options {
  patService: PatService;
}

export class PatMiddleware {
  private readonly patService: PatService;

  constructor({ patService }: Options) {
    this.patService = patService;

    this.requirePat = this.requirePat.bind(this);
  }

  public async requirePat(req: PatAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const userId = await this.authenticateRequest(req);

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    req.userId = userId;

    next();
  }

  public async authenticateRequest(req: Request): Promise<string | null> {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.substring(7);

    if (!token) {
      return null;
    }

    let userId;
    try {
      ({ userId } = await this.patService.verifyPat(token));
    } catch {
      return null;
    }

    return userId;
  }
}
