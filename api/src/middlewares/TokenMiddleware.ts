import { NextFunction, Request, Response } from 'express';

import { TokenService } from '../services/TokenService';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface Options {
  accessTokenCookieName: string;
  refreshTokenCookieName: string;
  tokenService: TokenService;
}

export class TokenMiddleware {
  private readonly accessTokenCookieName: string;
  private readonly refreshTokenCookieName: string;
  private readonly tokenService: TokenService;

  constructor({ accessTokenCookieName, refreshTokenCookieName, tokenService }: Options) {
    this.accessTokenCookieName = accessTokenCookieName;
    this.refreshTokenCookieName = refreshTokenCookieName;
    this.tokenService = tokenService;

    this.attach = this.attach.bind(this);
    this.remove = this.remove.bind(this);
    this.requireAccessToken = this.requireAccessToken.bind(this);
    this.requireRefreshToken = this.requireRefreshToken.bind(this);
  }

  public attach(req: Request, res: Response, next: NextFunction): void {
    if (res.locals.tokens) {
      res.cookie(this.accessTokenCookieName, res.locals.tokens.accessToken, {
        httpOnly: true,
        maxAge: res.locals.tokens.accessTokenExpiresIn * 1000,
        sameSite: 'none',
        secure: true,
      });

      res.cookie(this.refreshTokenCookieName, res.locals.tokens.refreshToken, {
        httpOnly: true,
        maxAge: res.locals.tokens.refreshTokenExpiresIn * 1000,
        sameSite: 'none',
        secure: true,
      });
    }

    next();
  }

  public remove(req: Request, res: Response, next: NextFunction): void {
    res.clearCookie(this.accessTokenCookieName);
    res.clearCookie(this.refreshTokenCookieName);

    next();
  }

  public requireAccessToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const accessToken = req.cookies[this.accessTokenCookieName];

    if (!accessToken) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let userId;
    try {
      ({ userId } = this.tokenService.verifyAccessToken(accessToken));
    } catch {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    req.userId = userId;

    next();
  }

  public requireRefreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const refreshToken = req.cookies[this.refreshTokenCookieName];

    if (!refreshToken) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let userId;
    try {
      ({ userId } = this.tokenService.verifyRefreshToken(refreshToken));
    } catch {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    req.userId = userId;

    next();
  }
}
