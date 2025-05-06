import jsonwebtoken from 'jsonwebtoken';

export class AuthMiddleware {
  constructor({ jwtSecret, stravaAuthCookieName }) {
    this.jwtSecret = jwtSecret;
    this.stravaAuthCookieName = stravaAuthCookieName;

    this.middleware = this.middleware.bind(this);
  }

  middleware(req, res, next) {
    const token = req.cookies[this.stravaAuthCookieName];

    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = jsonwebtoken.verify(token, this.jwtSecret);
    } catch {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    req.athleteId = decoded.sub;

    next();
  }
}
