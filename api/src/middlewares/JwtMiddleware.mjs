export class JwtMiddleware {
  constructor({ jwtCookieName, jwtService }) {
    this.jwtCookieName = jwtCookieName;
    this.jwtService = jwtService;

    this.attach = this.attach.bind(this);
    this.remove = this.remove.bind(this);
    this.require = this.require.bind(this);
  }

  attach(req, res, next) {
    if (res.locals.token) {
      res.cookie(this.jwtCookieName, res.locals.token.jwt, {
        httpOnly: true,
        maxAge: res.locals.token.expiresIn * 1000,
        sameSite: 'none',
        secure: true,
      });
    }

    next();
  }

  remove(req, res, next) {
    res.clearCookie(this.jwtCookieName);

    next();
  }

  require(req, res, next) {
    const jwt = req.cookies[this.jwtCookieName];

    if (!jwt) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    let userId;
    try {
      ({ userId } = this.jwtService.verify(jwt));
    } catch {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    req.userId = userId;

    next();
  }
}
