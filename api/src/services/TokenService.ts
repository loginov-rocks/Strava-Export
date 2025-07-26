import { JwtPayload, sign, verify } from 'jsonwebtoken';

interface Options {
  accessTokenExpiresIn: number;
  accessTokenSecret: string;
  refreshTokenExpiresIn: number;
  refreshTokenSecret: string;
}

interface AccessTokenPayload {
  userId: string;
  clientId?: string;
  scope?: string;
}

interface RefreshTokenPayload {
  userId: string;
  clientId?: string;
  scope?: string;
}

export class TokenService {
  private readonly accessTokenExpiresIn: number;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenExpiresIn: number;
  private readonly refreshTokenSecret: string;

  constructor({ accessTokenExpiresIn, accessTokenSecret, refreshTokenExpiresIn, refreshTokenSecret }: Options) {
    this.accessTokenExpiresIn = accessTokenExpiresIn;
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenExpiresIn = refreshTokenExpiresIn;
    this.refreshTokenSecret = refreshTokenSecret;
  }

  public signAccessToken({ userId, clientId, scope }: AccessTokenPayload) {
    const payload = {
      sub: userId,
      client_id: clientId,
      scope,
    };

    const expiresIn = this.accessTokenExpiresIn;
    const jwt = sign(payload, this.accessTokenSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  public signRefreshToken({ userId, clientId, scope }: RefreshTokenPayload) {
    const payload = {
      sub: userId,
      client_id: clientId,
      scope,
    };

    const expiresIn = this.refreshTokenExpiresIn;
    const jwt = sign(payload, this.refreshTokenSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  public verifyAccessToken(jwt: string): AccessTokenPayload {
    const payload = verify(jwt, this.accessTokenSecret) as JwtPayload;
    const userId = payload.sub;
    const clientId = payload.client_id;
    const scope = payload.scope;

    if (typeof userId !== 'string') {
      throw new Error('User ID not found in JWT');
    }

    return { userId, clientId, scope };
  }

  public verifyRefreshToken(jwt: string): RefreshTokenPayload {
    const payload = verify(jwt, this.refreshTokenSecret) as JwtPayload;
    const userId = payload.sub;
    const clientId = payload.client_id;
    const scope = payload.scope;

    if (typeof userId !== 'string') {
      throw new Error('User ID not found in JWT');
    }

    return { userId, clientId, scope };
  }
}
