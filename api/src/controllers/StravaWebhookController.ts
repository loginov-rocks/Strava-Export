import { Request, Response } from 'express';

import { StravaWebhookService } from '../services/StravaWebhookService';

interface Options {
  stravaWebhookService: StravaWebhookService;
  verifyToken: string;
}

// TODO: Draft.
export class StravaWebhookController {
  private readonly stravaWebhookService: StravaWebhookService;
  private readonly verifyToken: string;

  constructor({ stravaWebhookService, verifyToken }: Options) {
    this.stravaWebhookService = stravaWebhookService;
    this.verifyToken = verifyToken;

    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
  }

  public get(req: Request, res: Response): void {
    // @see https://developers.strava.com/docs/webhookexample
    if (req.query['hub.verify_token'] !== this.verifyToken) {
      res.sendStatus(403);
      return;
    }

    res.send({ 'hub.challenge': req.query['hub.challenge'] });
  }

  public post(req: Request, res: Response): void {
    if (!req.body || !['activity', 'athlete'].includes(req.body.object_type) || typeof req.body.object_id !== 'number'
      || !['create', 'update', 'delete'].includes(req.body.aspect_type) || typeof req.body.owner_id !== 'number') {
      res.sendStatus(400);
      return;
    }

    // Don't wait until the event is processed.
    this.stravaWebhookService.processEvent(req.body);

    // @see https://developers.strava.com/docs/webhookexample
    res.send('EVENT_RECEIVED');
  }
}
