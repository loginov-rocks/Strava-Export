export class AuthController {
  constructor({ authService }) {
    this.authService = authService;

    this.getStrava = this.getStrava.bind(this);
    this.postTokenMiddleware = this.postTokenMiddleware.bind(this);
    this.postToken = this.postToken.bind(this);
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

    let token;
    try {
      token = await this.authService.exchangeCode(code, scope, state);
    } catch (error) {
      console.error(error);

      return res.status(401).send({ message: 'Unauthorized' });
    }

    res.locals.token = token;

    next();
  }

  postToken(req, res) {
    return res.status(204).send();
  }
}
