import { TokenService } from '../services/TokenService';

interface Options {
  accessTokenCookieName: string;
  refreshTokenCookieName: string;
  tokenService: TokenService;
}

export class TokenMiddleware {
  private readonly accessTokenCookieName: string;
  private readonly refreshTokenCookieName: string;
  private readonly tokenService: TokenService;

  constructor({ accessTokenCookieName, refreshTokenCookieName, tokenService }: Options) {
    this.accessTokenCookieName = accessTokenCookieName;
    this.refreshTokenCookieName = refreshTokenCookieName;
    this.tokenService = tokenService;

    this.attach = this.attach.bind(this);
    this.remove = this.remove.bind(this);
    this.requireAccessToken = this.requireAccessToken.bind(this);
    this.requireRefreshToken = this.requireRefreshToken.bind(this);
  }

  public attach(req, res, next) {
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

  public remove(req, res, next) {
    res.clearCookie(this.accessTokenCookieName);
    res.clearCookie(this.refreshTokenCookieName);

    next();
  }

  public requireAccessToken(req, res, next) {
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

  public requireRefreshToken(req, res, next) {
    const refreshToken = req.cookies[this.refreshTokenCookieName];

    if (!refreshToken) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    let userId;
    try {
      ({ userId } = this.tokenService.verifyRefreshToken(refreshToken));
    } catch {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    req.userId = userId;

    next();
  }
}
