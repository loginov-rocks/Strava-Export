import jsonwebtoken from 'jsonwebtoken';

export class TokenService {
  constructor({ accessTokenExpiresIn, accessTokenSecret }) {
    this.accessTokenExpiresIn = accessTokenExpiresIn;
    this.accessTokenSecret = accessTokenSecret;
  }

  signAccessToken({ userId }) {
    const payload = {
      sub: userId,
    };

    const expiresIn = this.accessTokenExpiresIn;
    const jwt = jsonwebtoken.sign(payload, this.accessTokenSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  verifyAccessToken(jwt) {
    const payload = jsonwebtoken.verify(jwt, this.accessTokenSecret);

    return {
      userId: payload.sub,
    };
  }
}
