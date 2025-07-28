import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { UserData, UserModel } from '../models/userModel';

interface Options {
  encryptionIv: string;
  encryptionKey: string;
  userModel: UserModel;
}

export class UserRepository {
  private readonly encryptionIv: Buffer;
  private readonly encryptionKey: Buffer;
  private readonly userModel: UserModel;

  constructor({ encryptionIv, encryptionKey, userModel }: Options) {
    this.encryptionIv = Buffer.from(encryptionIv, 'hex');
    this.encryptionKey = Buffer.from(encryptionKey, 'hex');
    this.userModel = userModel;
  }

  public createOrUpdateByStravaAthleteId(stravaAthleteId: string, userData: UserData) {
    const encryptedUserData = JSON.parse(JSON.stringify(userData));

    encryptedUserData.stravaToken.accessToken = this.encrypt(userData.stravaToken.accessToken);
    encryptedUserData.stravaToken.refreshToken = this.encrypt(userData.stravaToken.refreshToken);

    return this.userModel.findOneAndUpdate({ stravaAthleteId }, encryptedUserData, { new: true, upsert: true });
  }

  public async findById(id: string) {
    const user = await this.userModel.findById(id);

    if (user) {
      user.stravaToken.accessToken = this.decrypt(user.stravaToken.accessToken);
      user.stravaToken.refreshToken = this.decrypt(user.stravaToken.refreshToken);
    }

    return user;
  }

  public updateOneById(id: string, userData: Partial<UserData>) {
    const encryptedUserData = JSON.parse(JSON.stringify(userData));

    if (userData.stravaToken) {
      encryptedUserData.stravaToken.accessToken = this.encrypt(userData.stravaToken.accessToken);
      encryptedUserData.stravaToken.refreshToken = this.encrypt(userData.stravaToken.refreshToken);
    }

    return this.userModel.updateOne({ _id: id }, encryptedUserData);
  }

  private encrypt(text: string): string {
    const uniqueIv = randomBytes(4);

    const combinedIv = Buffer.concat([this.encryptionIv, uniqueIv]);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, combinedIv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return uniqueIv.toString('hex') + ':' + encrypted + ':' + authTag;
  }

  private decrypt(encryptedText: string): string {
    const [uniqueIv, encrypted, authTag] = encryptedText.split(':');

    const combinedIv = Buffer.concat([
      this.encryptionIv,
      Buffer.from(uniqueIv, 'hex')
    ]);

    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, combinedIv);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
