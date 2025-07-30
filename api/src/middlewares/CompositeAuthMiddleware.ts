import { NextFunction, Response } from 'express';

import { PatAuthenticatedRequest, PatMiddleware } from './PatMiddleware';
import { WebAuthenticatedRequest, WebAuthMiddleware } from './WebAuthMiddleware';

export type CompositeAuthenticatedRequest = PatAuthenticatedRequest | WebAuthenticatedRequest;

interface Options {
  patMiddleware: PatMiddleware;
  webAuthMiddleware: WebAuthMiddleware;
}

export class CompositeAuthMiddleware {
  private readonly patMiddleware: PatMiddleware;
  private readonly webAuthMiddleware: WebAuthMiddleware;

  constructor({ patMiddleware, webAuthMiddleware }: Options) {
    this.patMiddleware = patMiddleware;
    this.webAuthMiddleware = webAuthMiddleware;

    this.requireWebAuthOrPat = this.requireWebAuthOrPat.bind(this);
  }

  public async requireWebAuthOrPat(
    req: CompositeAuthenticatedRequest, res: Response, next: NextFunction,
  ): Promise<void> {
    const tokenUserId = this.webAuthMiddleware.authenticateRequest(req, 'access');

    if (tokenUserId) {
      req.userId = tokenUserId;

      return next();
    }

    const patUserId = await this.patMiddleware.authenticateRequest(req);

    if (patUserId) {
      req.userId = patUserId;

      return next();
    }

    res.status(401).send({ message: 'Unauthorized' });
  }
}
