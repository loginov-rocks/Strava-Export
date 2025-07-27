import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types';
import { NextFunction, Request, Response } from 'express';

import { TokenService } from '../services/TokenService';

export interface McpAuthenticatedRequest extends Request {
  auth?: AuthInfo;
}

interface Options {
  mcpBaseUrl: string;
  tokenService: TokenService;
}

export class McpAuthMiddleware {
  private readonly mcpBaseUrl: string;
  private readonly tokenService: TokenService;

  constructor({ mcpBaseUrl, tokenService }: Options) {
    this.mcpBaseUrl = mcpBaseUrl;
    this.tokenService = tokenService;

    this.requireAuth = this.requireAuth.bind(this);
  }

  public requireAuth(req: McpAuthenticatedRequest, res: Response, next: NextFunction): void {
    const wwwAuthenticateHeader = `Bearer realm="mcp-server", resource_metadata="${this.mcpBaseUrl}/.well-known/oauth-protected-resource"`;

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      res.status(401).set('WWW-Authenticate', wwwAuthenticateHeader).send('Unauthorized');
      return;
    }

    const token = req.headers.authorization.substring(7);

    if (!token) {
      res.status(401).set('WWW-Authenticate', wwwAuthenticateHeader).send('Unauthorized');
      return;
    }

    let userId;
    try {
      ({ userId } = this.tokenService.verifyAccessToken(token));
    } catch {
      res.status(401).set('WWW-Authenticate', wwwAuthenticateHeader).send('Unauthorized');
      return;
    }

    req.auth = {
      clientId: userId,
      scopes: [],
      token,
    };

    next();
  }
}
