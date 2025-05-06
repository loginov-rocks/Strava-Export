export class StravaAuthController {
  constructor({ stravaAuthCookieName, stravaAuthService }) {
    this.stravaAuthCookieName = stravaAuthCookieName;
    this.stravaAuthService = stravaAuthService;

    this.getClientCredentials = this.getClientCredentials.bind(this);
    this.postExchangeCode = this.postExchangeCode.bind(this);
  }

  getClientCredentials(req, res) {
    const clientCredentials = this.stravaAuthService.getClientCredentials();

    return res.send(clientCredentials);
  }

  async postExchangeCode(req, res) {
    const { code } = req.body;

    let token;
    try {
      token = await this.stravaAuthService.exchangeCode(code);
    } catch (error) {
      console.error(error);

      return res.status(401).send({ message: 'Unauthorized' });
    }

    return res.cookie(this.stravaAuthCookieName, token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    }).status(204).send();
  }
}
