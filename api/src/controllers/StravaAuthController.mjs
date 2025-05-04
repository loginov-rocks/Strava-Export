export class StravaAuthController {
  constructor({ stravaAuthService }) {
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

    let response;
    try {
      response = await this.stravaAuthService.exchangeCode(code);
    } catch (error) {
      console.error(error);

      return res.status(401).send({ message: 'Unauthorized' });
    }

    return res.send(response);
  }
}
