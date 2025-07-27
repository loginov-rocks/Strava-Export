import { NextFunction, Request, Response } from 'express';

import { TokenAuthenticatedRequest } from '../middlewares/TokenMiddleware';
import { AuthService } from '../services/AuthService';

interface Options {
  authService: AuthService;
  webAppBaseUrl: string;
}

export class WebAuthController {
  private readonly authService: AuthService;
  private readonly webAppBaseUrl: string;

  constructor({ authService, webAppBaseUrl }: Options) {
    this.authService = authService;
    this.webAppBaseUrl = webAppBaseUrl;

    this.getAuthLogin = this.getAuthLogin.bind(this);
    this.getAuthCallbackMiddleware = this.getAuthCallbackMiddleware.bind(this);
    this.getAuthCallback = this.getAuthCallback.bind(this);
    this.getAuthMe = this.getAuthMe.bind(this);
    this.postAuthRefreshMiddleware = this.postAuthRefreshMiddleware.bind(this);
    this.postAuthRefresh = this.postAuthRefresh.bind(this);
    this.postAuthLogout = this.postAuthLogout.bind(this);
  }

  public getAuthLogin(req: Request, res: Response): void {
    // TODO: Extract constant.
    const url = this.authService.buildAuthorizeUrl('/auth/callback');

    res.redirect(url);
  }

  public async getAuthCallbackMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { code, scope, state } = req.query;

    if (typeof code !== 'string' || (scope && typeof scope !== 'string') || (state && typeof state !== 'string')) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let tokens;
    try {
      tokens = await this.authService.exchangeCode(code, scope, state);
    } catch (error) {
      console.error(error);

      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    res.locals.tokens = tokens;

    next();
  }

  public getAuthCallback(req: Request, res: Response): void {
    res.redirect(this.webAppBaseUrl);
  }

  public getAuthMe(req: TokenAuthenticatedRequest, res: Response): void {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    res.send({ userId });
  }

  public postAuthRefreshMiddleware(req: TokenAuthenticatedRequest, res: Response, next: NextFunction): void {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let tokens;
    try {
      tokens = this.authService.refreshTokens(userId);
    } catch (error) {
      console.error(error);

      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    res.locals.tokens = tokens;

    next();
  }

  public postAuthRefresh(req: Request, res: Response): void {
    res.status(204).send();
  }

  public postAuthLogout(req: Request, res: Response): void {
    res.status(204).send();
  }
}
