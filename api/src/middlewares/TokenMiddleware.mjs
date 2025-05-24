export class TokenMiddleware {
  constructor({ accessTokenCookieName, tokenService }) {
    this.accessTokenCookieName = accessTokenCookieName;
    this.tokenService = tokenService;

    this.attach = this.attach.bind(this);
    this.remove = this.remove.bind(this);
    this.require = this.require.bind(this);
  }

  attach(req, res, next) {
    if (res.locals.tokens) {
      res.cookie(this.accessTokenCookieName, res.locals.tokens.accessToken, {
        httpOnly: true,
        maxAge: res.locals.tokens.accessTokenExpiresIn * 1000,
        sameSite: 'none',
        secure: true,
      });
    }

    next();
  }

  remove(req, res, next) {
    res.clearCookie(this.accessTokenCookieName);

    next();
  }

  require(req, res, next) {
    const accessToken = req.cookies[this.accessTokenCookieName];

    if (!accessToken) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    let userId;
    try {
      ({ userId } = this.tokenService.verifyAccessToken(accessToken));
    } catch {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    req.userId = userId;

    next();
  }
}
