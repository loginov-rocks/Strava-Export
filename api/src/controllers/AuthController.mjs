export class AuthController {
  constructor({ authService }) {
    this.authService = authService;

    this.get = this.get.bind(this);
    this.getStrava = this.getStrava.bind(this);
    this.postTokenMiddleware = this.postTokenMiddleware.bind(this);
    this.postToken = this.postToken.bind(this);
    this.postRefreshMiddleware = this.postRefreshMiddleware.bind(this);
    this.postRefresh = this.postRefresh.bind(this);
    this.postLogout = this.postLogout.bind(this);
  }

  get(req, res) {
    return res.status(204).send();
  }

  getStrava(req, res) {
    const { redirectUri, state } = req.query;

    if (!redirectUri) {
      return res.status(400).send({ message: 'Bad Request' });
    }

    let url;
    try {
      url = this.authService.getAuthorizeUrl(redirectUri, state);
    } catch (error) {
      console.error(error);

      return res.status(400).send({ message: 'Bad Request' });
    }

    return res.send({ url });
  }

  async postTokenMiddleware(req, res, next) {
    const { code, scope, state } = req.body;

    let tokens;
    try {
      tokens = await this.authService.exchangeCode(code, scope, state);
    } catch (error) {
      console.error(error);

      return res.status(401).send({ message: 'Unauthorized' });
    }

    res.locals.tokens = tokens;

    next();
  }

  postToken(req, res) {
    return res.status(204).send();
  }

  postRefreshMiddleware(req, res, next) {
    const { userId } = req;

    let tokens;
    try {
      tokens = this.authService.refreshTokens(userId);
    } catch (error) {
      console.error(error);

      return res.status(401).send({ message: 'Unauthorized' });
    }

    res.locals.tokens = tokens;

    next();
  }

  postRefresh(req, res) {
    return res.status(204).send();
  }

  postLogout(req, res) {
    return res.status(204).send();
  }
}
