import { NextFunction, Request, Response } from 'express';

import { TokenAuthenticatedRequest } from '../middlewares/TokenMiddleware';
import { AuthService } from '../services/AuthService';

interface Options {
  authService: AuthService;
}

export class AuthController {
  private readonly authService: AuthService;

  constructor({ authService }: Options) {
    this.authService = authService;

    this.getAuth = this.getAuth.bind(this);
    this.getAuthStrava = this.getAuthStrava.bind(this);
    this.postAuthTokenMiddleware = this.postAuthTokenMiddleware.bind(this);
    this.postAuthToken = this.postAuthToken.bind(this);
    this.postAuthRefreshMiddleware = this.postAuthRefreshMiddleware.bind(this);
    this.postAuthRefresh = this.postAuthRefresh.bind(this);
    this.postAuthLogout = this.postAuthLogout.bind(this);
  }

  public getAuth(req: Request, res: Response): void {
    res.status(204).send();
  }

  public getAuthStrava(req: Request, res: Response): void {
    const { redirectUri, state } = req.query;

    if (!redirectUri || typeof redirectUri !== 'string' || (state && typeof state !== 'string')) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let url;
    try {
      url = this.authService.getAuthorizeUrl(redirectUri, state);
    } catch (error) {
      console.error(error);

      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    res.send({ url });
  }

  public async postAuthTokenMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.body) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    const { code, scope, state } = req.body;

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

  public postAuthToken(req: Request, res: Response): void {
    res.status(204).send();
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
