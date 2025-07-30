import { NextFunction, Request, Response } from 'express';

import { WebAuthenticatedRequest } from '../middlewares/WebAuthMiddleware';
import { WebAuthService } from '../services/WebAuthService';

interface Options {
  apiBaseUrl: string;
  webAppBaseUrl: string;
  webAuthService: WebAuthService;
}

export class WebAuthController {
  private readonly apiBaseUrl: string;
  private readonly webAppBaseUrl: string;
  private readonly webAuthService: WebAuthService;

  constructor({ apiBaseUrl, webAppBaseUrl, webAuthService }: Options) {
    this.apiBaseUrl = apiBaseUrl;
    this.webAppBaseUrl = webAppBaseUrl;
    this.webAuthService = webAuthService;

    this.getAuthLogin = this.getAuthLogin.bind(this);
    this.getAuthCallbackMiddleware = this.getAuthCallbackMiddleware.bind(this);
    this.getAuthCallback = this.getAuthCallback.bind(this);
    this.getAuthMe = this.getAuthMe.bind(this);
    this.postAuthRefreshMiddleware = this.postAuthRefreshMiddleware.bind(this);
    this.postAuthRefresh = this.postAuthRefresh.bind(this);
    this.postAuthLogout = this.postAuthLogout.bind(this);
  }

  public getAuthLogin(req: Request, res: Response): void {
    // TODO: Extract route configuration.
    const redirectUri = `${this.apiBaseUrl}/auth/callback`;
    const url = this.webAuthService.buildStravaAuthorizeUrl(redirectUri);

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
      tokens = await this.webAuthService.authorizeStravaUserAndCreateTokens(code, scope, state);
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

  public getAuthMe(req: WebAuthenticatedRequest, res: Response): void {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    res.send({ userId });
  }

  public async postAuthRefreshMiddleware(
    req: WebAuthenticatedRequest, res: Response, next: NextFunction,
  ): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let tokens;
    try {
      tokens = await this.webAuthService.refreshTokens(userId);
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
