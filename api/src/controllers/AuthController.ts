import { randomUUID } from 'crypto';
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

    this.getServerMetadata = this.getServerMetadata.bind(this);
    this.postOAuthRegister = this.postOAuthRegister.bind(this);
    this.getOAuthAuthorize = this.getOAuthAuthorize.bind(this);
    this.getOAuthRedirect = this.getOAuthRedirect.bind(this);
    this.postOAuthToken = this.postOAuthToken.bind(this);

    this.getAuth = this.getAuth.bind(this);
    this.getAuthStrava = this.getAuthStrava.bind(this);
    this.postAuthTokenMiddleware = this.postAuthTokenMiddleware.bind(this);
    this.postAuthToken = this.postAuthToken.bind(this);
    this.postAuthRefreshMiddleware = this.postAuthRefreshMiddleware.bind(this);
    this.postAuthRefresh = this.postAuthRefresh.bind(this);
    this.postAuthLogout = this.postAuthLogout.bind(this);
  }

  public getServerMetadata(req: Request, res: Response): void {
    const issuer = `${req.protocol}://${req.get('host')}`;

    res.send({
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      registration_endpoint: `${issuer}/oauth/register`,
      grant_types_supported: [
        'authorization_code',
        'client_credentials',
      ],
      code_challenge_methods_supported: ['S256'],
    });
  }

  public postOAuthRegister(req: Request, res: Response): void {
    const claudeParams = req.body;
    const clientId = randomUUID();

    res.status(201).send({
      client_id: clientId,
      client_name: claudeParams.client_name,
      grant_types: claudeParams.grant_types,
      response_types: claudeParams.response_types,
      token_endpoint_auth_method: claudeParams.token_endpoint_auth_method,
      scope: claudeParams.scope,
      redirect_uris: claudeParams.redirect_uris,
    });
  }

  public getOAuthAuthorize(req: Request, res: Response): void {
    const claudeParams = req.query;
    const state = JSON.stringify(claudeParams);

    let url;
    try {
      url = this.authService.getAuthorizeUrl(`${req.protocol}://${req.get('host')}/oauth/redirect`, state);
    } catch (error) {
      console.error(error);

      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    res.redirect(url);
  }

  public getOAuthRedirect(req: Request, res: Response): void {
    if (typeof req.query.code !== 'string' || typeof req.query.state !== 'string') {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    const claudeParams = JSON.parse(req.query.state);
    const stravaCode = req.query.code;

    const redirectUrl = new URL(claudeParams.redirect_uri);
    redirectUrl.searchParams.set('code', stravaCode);

    if (claudeParams.state) {
      redirectUrl.searchParams.set('state', claudeParams.state);
    }

    res.redirect(redirectUrl.toString());
  }

  public async postOAuthToken(req: Request, res: Response): Promise<void> {
    const { code } = req.body;

    let tokens;
    try {
      tokens = await this.authService.exchangeCode(code);
    } catch (error) {
      console.error(error);

      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    res.send({
      access_token: tokens.accessToken,
      token_type: 'Bearer',
      expires_in: tokens.accessTokenExpiresIn,
      refresh_token: tokens.refreshToken,
      scope: 'claudeai',
    });
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
