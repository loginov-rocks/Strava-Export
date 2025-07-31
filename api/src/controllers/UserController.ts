import { Response } from 'express';

import { UserDtoFactory } from '../dtoFactories/UserDtoFactory';
import { WebAuthenticatedRequest } from '../middlewares/WebAuthMiddleware';
import { UserService } from '../services/UserService';

interface Options {
  userDtoFactory: UserDtoFactory;
  userService: UserService;
}

export class UserController {
  private readonly userDtoFactory: UserDtoFactory;
  private readonly userService: UserService;

  constructor({ userDtoFactory, userService }: Options) {
    this.userDtoFactory = userDtoFactory;
    this.userService = userService;

    this.getUsersMe = this.getUsersMe.bind(this);
    this.patchUsersMe = this.patchUsersMe.bind(this);
    this.getUser = this.getUser.bind(this);
  }

  public async getUsersMe(req: WebAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let user;
    try {
      user = await this.userService.getUser(userId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!user) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    res.send(this.userDtoFactory.createJson(user));
  }

  public async patchUsersMe(req: WebAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;

    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    let user;
    try {
      user = await this.userService.getUser(userId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!user) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    if (!req.body || typeof req.body.isPublic !== 'boolean') {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    try {
      user = await this.userService.updateUser(user.id, { isPublic: req.body.isPublic });
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!user) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    res.send(this.userDtoFactory.createJson(user));
  }

  public async getUser(req: WebAuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req;
    const { stravaAthleteId } = req.params;

    if (!stravaAthleteId) {
      res.status(400).send({ message: 'Bad Request' });
      return;
    }

    let user;
    try {
      user = await this.userService.getUserByStravaAthleteId(stravaAthleteId);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: 'Internal Server Error' });
      return;
    }

    if (!user || (!user.isPublic && !userId) || (!user.isPublic && user.id !== userId)) {
      res.status(404).send({ message: 'Not Found' });
      return;
    }

    res.send(this.userDtoFactory.createJson(user));
  }
}
