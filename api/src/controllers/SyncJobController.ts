import { Response } from 'express';

import { SyncJobDtoFactory } from '../dtoFactories/SyncJobDtoFactory';
import { WebAuthenticatedRequest } from '../middlewares/WebAuthMiddleware';
import { SyncJobService } from '../services/SyncJobService';
import { isValidPositiveIntegerString } from '../utils/isValid';

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

  public async postSyncJob(req: WebAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let refreshLastDays;
    if (req.body && req.body.refreshLastDays) {
      // TODO: Improve validation.
      if (isValidPositiveIntegerString(req.body.refreshLastDays.toString()) && req.body.refreshLastDays > 0) {
        refreshLastDays = req.body.refreshLastDays;
      } else {
        res.status(400).send({ message: 'Bad Request' });
        return;
      }
    }

    let syncJob;
    try {
      syncJob = await this.syncJobService.createSyncJob(userId, {
        refreshLastDays,
      });
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    res.status(201).send(this.syncJobDtoFactory.createJson(syncJob));
  }

  public async getSyncJobs(req: WebAuthenticatedRequest, res: Response): Promise<void> {
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

  public async getSyncJob(req: WebAuthenticatedRequest, res: Response): Promise<void> {
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
