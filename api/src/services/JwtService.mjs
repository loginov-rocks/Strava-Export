import jsonwebtoken from 'jsonwebtoken';

export class JwtService {
  constructor({ jwtExpiresIn, jwtSecret }) {
    this.jwtExpiresIn = jwtExpiresIn;
    this.jwtSecret = jwtSecret;
  }

  sign({ userId }) {
    const payload = {
      sub: userId,
    };

    const expiresIn = this.jwtExpiresIn;
    const jwt = jsonwebtoken.sign(payload, this.jwtSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  verify(jwt) {
    const payload = jsonwebtoken.verify(jwt, this.jwtSecret);

    return {
      userId: payload.sub,
    };
  }
}
