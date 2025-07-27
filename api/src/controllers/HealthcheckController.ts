import { Request, Response } from 'express';

export class HealthcheckController {
  constructor() {
    this.get = this.get.bind(this);
  }

  public get(req: Request, res: Response): void {
    res.send('OK');
  }
}
