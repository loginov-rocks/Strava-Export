import { sign, verify } from 'jsonwebtoken';

interface Options {
  accessTokenExpiresIn: number;
  accessTokenSecret: string;
  refreshTokenExpiresIn: number;
  refreshTokenSecret: string;
}

interface AccessTokenPayload {
  userId: string;
}

interface RefreshTokenPayload {
  userId: string;
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

  public signAccessToken({ userId }: AccessTokenPayload) {
    const payload = {
      sub: userId,
    };

    const expiresIn = this.accessTokenExpiresIn;
    const jwt = sign(payload, this.accessTokenSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  signRefreshToken({ userId }: RefreshTokenPayload) {
    const payload = {
      sub: userId,
    };

    const expiresIn = this.refreshTokenExpiresIn;
    const jwt = sign(payload, this.refreshTokenSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  verifyAccessToken(jwt: string) {
    const payload = verify(jwt, this.accessTokenSecret);

    return {
      userId: payload.sub,
    };
  }

  verifyRefreshToken(jwt: string) {
    const payload = verify(jwt, this.refreshTokenSecret);

    return {
      userId: payload.sub,
    };
  }
}
