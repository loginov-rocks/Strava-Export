import { NextFunction, Request, Response } from 'express';

import { AuthenticatedRequest } from '../middlewares/TokenMiddleware';
import { AuthService } from '../services/AuthService';

interface Options {
  authService: AuthService;
}

export class AuthController {
  private readonly authService: AuthService;

  constructor({ authService }: Options) {
    this.authService = authService;

    this.get = this.get.bind(this);
    this.getStrava = this.getStrava.bind(this);
    this.postTokenMiddleware = this.postTokenMiddleware.bind(this);
    this.postToken = this.postToken.bind(this);
    this.postRefreshMiddleware = this.postRefreshMiddleware.bind(this);
    this.postRefresh = this.postRefresh.bind(this);
    this.postLogout = this.postLogout.bind(this);
  }

  public get(req: Request, res: Response): void {
    res.status(204).send();
  }

  public getStrava(req: Request, res: Response): void {
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

  public async postTokenMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  public postToken(req: Request, res: Response): void {
    res.status(204).send();
  }

  public postRefreshMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
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

  public postRefresh(req: Request, res: Response): void {
    res.status(204).send();
  }

  public postLogout(req: Request, res: Response): void {
    res.status(204).send();
  }
}
