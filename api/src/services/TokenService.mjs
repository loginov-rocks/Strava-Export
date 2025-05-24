import jsonwebtoken from 'jsonwebtoken';

export class TokenService {
  constructor({ accessTokenExpiresIn, accessTokenSecret, refreshTokenExpiresIn, refreshTokenSecret }) {
    this.accessTokenExpiresIn = accessTokenExpiresIn;
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenExpiresIn = refreshTokenExpiresIn;
    this.refreshTokenSecret = refreshTokenSecret;
  }

  signAccessToken({ userId }) {
    const payload = {
      sub: userId,
    };

    const expiresIn = this.accessTokenExpiresIn;
    const jwt = jsonwebtoken.sign(payload, this.accessTokenSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  signRefreshToken({ userId }) {
    const payload = {
      sub: userId,
    };

    const expiresIn = this.refreshTokenExpiresIn;
    const jwt = jsonwebtoken.sign(payload, this.refreshTokenSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  verifyAccessToken(jwt) {
    const payload = jsonwebtoken.verify(jwt, this.accessTokenSecret);

    return {
      userId: payload.sub,
    };
  }

  verifyRefreshToken(jwt) {
    const payload = jsonwebtoken.verify(jwt, this.refreshTokenSecret);

    return {
      userId: payload.sub,
    };
  }
}
