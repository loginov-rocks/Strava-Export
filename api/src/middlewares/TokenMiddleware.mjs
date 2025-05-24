export class TokenMiddleware {
  constructor({ accessTokenCookieName, refreshTokenCookieName, tokenService }) {
    this.accessTokenCookieName = accessTokenCookieName;
    this.refreshTokenCookieName = refreshTokenCookieName;
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

      res.cookie(this.refreshTokenCookieName, res.locals.tokens.refreshToken, {
        httpOnly: true,
        maxAge: res.locals.tokens.refreshTokenExpiresIn * 1000,
        sameSite: 'none',
        secure: true,
      });
    }

    next();
  }

  remove(req, res, next) {
    res.clearCookie(this.accessTokenCookieName);
    res.clearCookie(this.refreshTokenCookieName);

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
