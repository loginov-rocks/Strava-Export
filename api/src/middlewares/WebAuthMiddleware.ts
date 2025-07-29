import { NextFunction, Request, Response } from 'express';

import { TokenService } from '../services/TokenService';

export interface WebAuthenticatedRequest extends Request {
  userId?: string;
}

interface Options {
  accessTokenCookieName: string;
  refreshTokenCookieName: string;
  tokenService: TokenService;
}

export class WebAuthMiddleware {
  private readonly accessTokenCookieName: string;
  private readonly refreshTokenCookieName: string;
  private readonly tokenService: TokenService;

  constructor({ accessTokenCookieName, refreshTokenCookieName, tokenService }: Options) {
    this.accessTokenCookieName = accessTokenCookieName;
    this.refreshTokenCookieName = refreshTokenCookieName;
    this.tokenService = tokenService;

    this.attachTokens = this.attachTokens.bind(this);
    this.removeTokens = this.removeTokens.bind(this);
    this.optionalAccessToken = this.optionalAccessToken.bind(this);
    this.requireAccessToken = this.requireAccessToken.bind(this);
    this.requireRefreshToken = this.requireRefreshToken.bind(this);
  }

  public attachTokens(req: Request, res: Response, next: NextFunction): void {
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

  public removeTokens(req: Request, res: Response, next: NextFunction): void {
    res.clearCookie(this.accessTokenCookieName);
    res.clearCookie(this.refreshTokenCookieName);

    next();
  }

  public optionalAccessToken(req: WebAuthenticatedRequest, res: Response, next: NextFunction): void {
    const userId = this.authenticateRequest(req, 'access');

    if (userId) {
      req.userId = userId;
    }

    next();
  }

  public requireAccessToken(req: WebAuthenticatedRequest, res: Response, next: NextFunction): void {
    const userId = this.authenticateRequest(req, 'access');

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    req.userId = userId;

    next();
  }

  public requireRefreshToken(req: WebAuthenticatedRequest, res: Response, next: NextFunction): void {
    const userId = this.authenticateRequest(req, 'refresh');

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    req.userId = userId;

    next();
  }

  public authenticateRequest(req: Request, tokenType: 'access' | 'refresh'): string | null {
    const token = req.cookies[tokenType === 'refresh' ? this.refreshTokenCookieName : this.accessTokenCookieName];

    if (!token) {
      return null;
    }

    let userId;
    try {
      ({ userId } = tokenType === 'refresh'
        ? this.tokenService.verifyRefreshToken(token)
        : this.tokenService.verifyAccessToken(token));
    } catch {
      return null;
    }

    return userId;
  }
}
