import { Response } from 'express';

import { SyncJobDtoFactory } from '../dtoFactories/SyncJobDtoFactory';
import { TokenAuthenticatedRequest } from '../middlewares/TokenMiddleware';
import { SyncJobService } from '../services/SyncJobService';

interface Options {
  syncJobDtoFactory: SyncJobDtoFactory;
  syncJobService: SyncJobService;
}

export class SyncJobController {
  private readonly syncJobDtoFactory: SyncJobDtoFactory;
  private readonly syncJobService: SyncJobService;

  constructor({ syncJobDtoFactory, syncJobService }: Options) {
    this.syncJobDtoFactory = syncJobDtoFactory;
    this.syncJobService = syncJobService;

    this.postSyncJob = this.postSyncJob.bind(this);
    this.getSyncJobs = this.getSyncJobs.bind(this);
    this.getSyncJob = this.getSyncJob.bind(this);
  }

  public async postSyncJob(req: TokenAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let refreshLastDaysInt;
    if (req.body && req.body.refreshLastDays) {
      refreshLastDaysInt = parseInt(req.body.refreshLastDays, 10);

      if (isNaN(refreshLastDaysInt) || refreshLastDaysInt <= 0 ||
        refreshLastDaysInt.toString() !== req.body.refreshLastDays.toString()) {
        res.status(400).send({ message: 'Bad Request' });
        return;
      }
    }

    let syncJob;
    try {
      syncJob = await this.syncJobService.createSyncJob(userId, {
        refreshLastDays: refreshLastDaysInt,
      });
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.status(201).send(this.syncJobDtoFactory.createJson(syncJob));
  }

  public async getSyncJobs(req: TokenAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let syncJobs;
    try {
      syncJobs = await this.syncJobService.getSyncJobsByUserId(userId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.send(this.syncJobDtoFactory.createJsonCollection(syncJobs));
  }

  public async getSyncJob(req: TokenAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const { syncJobId } = req.params;

    if (!syncJobId) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let syncJob;
    try {
      syncJob = await this.syncJobService.getSyncJob(syncJobId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!syncJob || syncJob.userId !== userId) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    res.send(this.syncJobDtoFactory.createJson(syncJob));
  }
}
