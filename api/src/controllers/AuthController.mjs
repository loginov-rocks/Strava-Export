export class AuthController {
  constructor({ stravaApiClient, stravaApiClientId }) {
    this.stravaApiClient = stravaApiClient;
    this.stravaApiClientId = stravaApiClientId;

    this.getClientCredentials = this.getClientCredentials.bind(this);
    this.postExchangeCode = this.postExchangeCode.bind(this);
  }

  getClientCredentials(req, res) {
    return res.send({
      clientId: this.stravaApiClientId,
    });
  }

  async postExchangeCode(req, res) {
    const { code } = req.body;

    let response;
    try {
      response = await this.stravaApiClient.token(code);
    } catch (error) {
      console.error(error);

      return res.status(401).send({ message: 'Unauthorized' });
    }

    return res.send(response);
  }
}
