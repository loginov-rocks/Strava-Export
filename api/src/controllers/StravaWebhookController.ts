import { Request, Response } from 'express';

interface Options {
  verifyToken: string;
}

// TODO: Draft.
export class StravaWebhookController {
  private readonly verifyToken: string;

  constructor({ verifyToken }: Options) {
    this.verifyToken = verifyToken;

    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
  }

  public get(req: Request, res: Response): void {
    console.log('StravaWebhookController.get', JSON.stringify(req.query));

    if (req.query.verify_token !== this.verifyToken) {
      res.status(400).send('Bad Request');
    }

    // Strava expects this to be returned back.
    res.send({
      'hub.challenge': req.query['hub.challenge'],
    });
  }

  public post(req: Request, res: Response): void {
    console.log('StravaWebhookController.post', JSON.stringify(req.body));

    // Strava expects HTTP code 200.
    res.send('OK');
  }
}
