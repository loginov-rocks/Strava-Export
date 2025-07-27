import { Request, Response } from 'express';

import { TokenAuthenticatedRequest } from '../middlewares/TokenMiddleware';
import { OAuthService } from '../services/OAuthService';

interface Options {
  apiUrl: string;
  oauthService: OAuthService;
}

export class OAuthController {
  private readonly apiUrl: string;
  private readonly oauthService: OAuthService;

  constructor({ apiUrl, oauthService }: Options) {
    this.apiUrl = apiUrl;
    this.oauthService = oauthService;

    this.getServerMetadata = this.getServerMetadata.bind(this);
    this.postOAuthRegister = this.postOAuthRegister.bind(this);
    this.getOAuthAuthorize = this.getOAuthAuthorize.bind(this);
    this.getOAuthCallback = this.getOAuthCallback.bind(this);
    this.postOAuthToken = this.postOAuthToken.bind(this);
  }

  public getServerMetadata(req: Request, res: Response): void {
    const issuer = this.apiUrl;

    // TODO: Unbind from routing constants.
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

  public async postOAuthRegister(req: Request, res: Response): Promise<void> {
    const { client_name, grant_types, response_types, token_endpoint_auth_method, scope, redirect_uris } = req.body;

    // TODO: Improve validation.
    if (typeof client_name !== 'string' || !Array.isArray(grant_types) || !Array.isArray(response_types)
      || token_endpoint_auth_method !== 'none' || typeof scope !== 'string' || !Array.isArray(redirect_uris)) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let client;
    try {
      client = await this.oauthService.createClient({
        name: client_name,
        redirectUris: redirect_uris,
        scope,
      });
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.status(201).send({
      client_id: client._id.toString(),
      client_name: client.name,
      grant_types,
      response_types,
      token_endpoint_auth_method,
      scope: client.scope,
      redirect_uris: client.redirectUris,
    });
  }

  public async getOAuthAuthorize(req: TokenAuthenticatedRequest, res: Response): Promise<void> {
    const { client_id, code_challenge, code_challenge_method, redirect_uri, response_type, scope, state } = req.query;

    // TODO: Improve validation.
    if (typeof client_id !== 'string' || typeof code_challenge !== 'string' || code_challenge_method !== 'S256'
      || typeof redirect_uri !== 'string' || response_type !== 'code' || typeof scope !== 'string'
      || typeof state !== 'string') {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let client;
    try {
      client = await this.oauthService.getClient(client_id);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!client || !client.redirectUris.includes(redirect_uri) || scope !== client.scope) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    // User is already authorized.
    if (req.userId) {
      let storedCode;
      try {
        storedCode = await this.oauthService.createCode({
          userId: req.userId,
          clientId: client._id.toString(),
          codeChallenge: code_challenge,
          redirectUri: redirect_uri,
          scope: scope,
        });
      } catch (error) {
        console.error(error);

        res.status(500).send({ message: 'Internal Server Error' });
        return;
      }

      const url = new URL(redirect_uri);
      url.searchParams.set('code', storedCode._id.toString());
      url.searchParams.set('state', state);
      res.redirect(url.toString());
      return;
    }

    let storedState;
    try {
      storedState = await this.oauthService.createState({
        clientId: client._id.toString(),
        codeChallenge: code_challenge,
        redirectUri: redirect_uri,
        scope,
        state,
      });
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    // TODO: Unbind from routing constants.
    const url = this.oauthService.buildAuthorizeUrl('/oauth/callback', storedState._id.toString());

    res.redirect(url);
  }

  public async getOAuthCallback(req: Request, res: Response): Promise<void> {
    const { code, scope, state } = req.query;

    if (typeof code !== 'string' || typeof state !== 'string' || (scope && typeof scope !== 'string')) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let storedState;
    try {
      storedState = await this.oauthService.getState(state);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!storedState) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let userId;
    try {
      userId = await this.oauthService.validateCode(code, scope, state);
    } catch {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let storedCode;
    try {
      storedCode = await this.oauthService.createCode({
        userId,
        clientId: storedState.clientId,
        codeChallenge: storedState.codeChallenge,
        redirectUri: storedState.redirectUri,
        scope: storedState.scope,
      });
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    const url = new URL(storedState.redirectUri);
    url.searchParams.set('code', storedCode._id.toString());
    url.searchParams.set('state', storedState.state);

    // Delete the stored state at the very last step for better fault tolerance.
    try {
      await this.oauthService.deleteState(storedState._id.toString());
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.redirect(url.toString());
  }

  public async postOAuthToken(req: Request, res: Response): Promise<void> {
    const { grant_type, code, client_id, code_verifier, redirect_uri, refresh_token } = req.body;

    if (!['authorization_code', 'refresh_token'].includes(grant_type)
      || (grant_type === 'authorization_code' && (typeof code !== 'string' || typeof code_verifier !== 'string'
        || typeof redirect_uri !== 'string'))
      || (grant_type === 'refresh_token' && typeof refresh_token !== 'string')
      || typeof client_id !== 'string') {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let client;
    try {
      client = await this.oauthService.getClient(client_id);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!client) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let tokens, scope;

    if (grant_type === 'authorization_code') {
      let storedCode;
      try {
        storedCode = await this.oauthService.getCode(code);
      } catch (error) {
        console.error(error);

        res.status(500).send({ message: 'Internal Server Error' });
        return;
      }

      if (!storedCode || client_id !== storedCode.clientId || redirect_uri !== storedCode.redirectUri
        || this.oauthService.computeChallenge(code_verifier) !== storedCode.codeChallenge) {
        res.status(400).send({ message: 'Bad Request' });
        return;
      }

      tokens = this.oauthService.createTokens(storedCode.userId, client_id, storedCode.scope);
      scope = storedCode.scope;

      // Delete the stored code at the very last step for better fault tolerance.
      try {
        await this.oauthService.deleteCode(storedCode._id.toString());
      } catch (error) {
        console.error(error);

        res.status(500).send({ message: 'Internal Server Error' });
        return;
      }
    } else if (grant_type === 'refresh_token') {
      let payload;
      try {
        payload = this.oauthService.verifyRefreshToken(refresh_token);
      } catch {
        res.status(401).send({ message: 'Unauthorized' });
        return;
      }

      if (client_id !== payload.clientId || !payload.scope) {
        res.status(400).send({ message: 'Bad Request' });
        return;
      }

      tokens = this.oauthService.createTokens(payload.userId, client_id, payload.scope);
      scope = payload.scope;
    }

    if (!tokens) {
      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.send({
      access_token: tokens.accessToken,
      token_type: 'Bearer',
      expires_in: tokens.accessTokenExpiresIn,
      refresh_token: tokens.refreshToken,
      scope,
    });
  }
}
