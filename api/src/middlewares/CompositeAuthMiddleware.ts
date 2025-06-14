import { NextFunction, Response } from 'express';

import { PatAuthenticatedRequest, PatMiddleware } from './PatMiddleware';
import { TokenAuthenticatedRequest, TokenMiddleware } from './TokenMiddleware';

export type CompositeAuthenticatedRequest = PatAuthenticatedRequest | TokenAuthenticatedRequest;

interface Options {
  patMiddleware: PatMiddleware;
  tokenMiddleware: TokenMiddleware;
}

export class CompositeAuthMiddleware {
  private readonly patMiddleware: PatMiddleware;
  private readonly tokenMiddleware: TokenMiddleware;

  constructor({ tokenMiddleware, patMiddleware }: Options) {
    this.tokenMiddleware = tokenMiddleware;
    this.patMiddleware = patMiddleware;

    this.requireAccessTokenOrPat = this.requireAccessTokenOrPat.bind(this);
  }

  public async requireAccessTokenOrPat(
    req: CompositeAuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const tokenUserId = this.tokenMiddleware.authenticateRequest(req, 'access');

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
