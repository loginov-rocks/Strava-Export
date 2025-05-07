import jsonwebtoken from 'jsonwebtoken';

export class JwtService {
  constructor({ jwtExpiresIn, jwtSecret }) {
    this.jwtExpiresIn = jwtExpiresIn;
    this.jwtSecret = jwtSecret;
  }

  sign({ athleteId }) {
    const payload = {
      sub: athleteId,
    };

    const expiresIn = this.jwtExpiresIn;
    const jwt = jsonwebtoken.sign(payload, this.jwtSecret, { expiresIn });

    return { expiresIn, jwt };
  }

  verify(jwt) {
    const payload = jsonwebtoken.verify(jwt, this.jwtSecret);

    return {
      athleteId: payload.sub,
    };
  }
}
