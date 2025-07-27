import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types';
import { NextFunction, Request, Response } from 'express';

import { TokenService } from '../services/TokenService';

export interface McpAuthenticatedRequest extends Request {
  auth?: AuthInfo;
}

interface Options {
  mcpUrl: string;
  tokenService: TokenService;
}

export class McpAuthMiddleware {
  private readonly mcpUrl: string;
  private readonly tokenService: TokenService;

  constructor({ mcpUrl, tokenService }: Options) {
    this.mcpUrl = mcpUrl;
    this.tokenService = tokenService;

    this.requireAuth = this.requireAuth.bind(this);
  }

  public requireAuth(req: McpAuthenticatedRequest, res: Response, next: NextFunction): void {
    const wwwAuthenticateHeader = `Bearer realm="mcp-server", resource_metadata="${this.mcpUrl}/.well-known/oauth-protected-resource"`;

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
