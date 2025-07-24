import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

import { AuthService } from '../services/AuthService';

interface Options {
  apiBaseUrl: string;
  authService: AuthService;
}

export class OAuthController {
  private readonly apiBaseUrl: string;
  private readonly authService: AuthService;

  constructor({ apiBaseUrl, authService }: Options) {
    this.apiBaseUrl = apiBaseUrl;
    this.authService = authService;

    this.getServerMetadata = this.getServerMetadata.bind(this);
    this.postOAuthRegister = this.postOAuthRegister.bind(this);
    this.getOAuthAuthorize = this.getOAuthAuthorize.bind(this);
    this.getOAuthCallback = this.getOAuthCallback.bind(this);
    this.postOAuthToken = this.postOAuthToken.bind(this);
  }

  public getServerMetadata(req: Request, res: Response): void {
    const issuer = this.apiBaseUrl;

    // TODO: Extract constants.
    res.send({
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      registration_endpoint: `${issuer}/oauth/register`,
      grant_types_supported: [
        'authorization_code',
        'client_credentials',
      ],
      code_challenge_methods_supported: [
        'S256',
      ],
    });
  }

  public postOAuthRegister(req: Request, res: Response): void {
    const { client_name, grant_types, response_types, token_endpoint_auth_method, scope, redirect_uris } = req.body;

    // TODO: Improve validation.
    if (typeof client_name !== 'string' || !Array.isArray(grant_types) || !Array.isArray(response_types)
      || token_endpoint_auth_method !== 'none' || typeof scope !== 'string' || !Array.isArray(redirect_uris)) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    const client_id = randomUUID();

    res.status(201).send({
      client_id, client_name, grant_types, response_types, token_endpoint_auth_method, scope, redirect_uris,
    });
  }

  public getOAuthAuthorize(req: Request, res: Response): void {
    const { client_id, code_challenge, code_challenge_method, redirect_uri, response_type, scope, state } = req.query;

    // TODO: Improve validation.
    if (typeof client_id !== 'string' || typeof code_challenge !== 'string' || code_challenge_method !== 'S256'
      || typeof redirect_uri !== 'string' || response_type !== 'code' || typeof scope !== 'string'
      || typeof state !== 'string') {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    // TODO: Store client params in the database and return reference to the database record as a state.
    const stateWithClientParams = JSON.stringify({
      client_id, code_challenge, code_challenge_method, redirect_uri, response_type, scope, state,
    });

    // TODO: Extract constant.
    const url = this.authService.buildAuthorizeUrl('/oauth/callback', stateWithClientParams);

    res.redirect(url);
  }

  public getOAuthCallback(req: Request, res: Response): void {
    const { code, scope, state } = req.query;

    if (typeof code !== 'string' || typeof state !== 'string' || (scope && typeof scope !== 'string')) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    // TODO: Extract client params from the database using state as a reference to the database record.
    const clientParams = JSON.parse(state);

    // TODO: Consider creating own authorization code instead of passing Strava authorization code.
    const url = new URL(clientParams.redirect_uri);
    url.searchParams.set('code', code);

    if (clientParams.state) {
      url.searchParams.set('state', clientParams.state);
    }

    res.redirect(url.toString());
  }

  public async postOAuthToken(req: Request, res: Response): Promise<void> {
    const { grant_type, code, client_id, code_verifier, redirect_uri } = req.body;

    // TODO: Improve validation.
    if (grant_type !== 'authorization_code' || typeof code !== 'string' || typeof client_id !== 'string'
      || typeof code_verifier !== 'string' || typeof redirect_uri !== 'string') {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    // TODO: Consider using own authorization code instead of expecting Strava authorization code from the client.
    // TODO: Consider issuing MCP specific tokens.
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
      // TODO: Consider keeping scope received from Claude at authorization endpoint.
      scope: 'claudeai',
    });
  }
}
