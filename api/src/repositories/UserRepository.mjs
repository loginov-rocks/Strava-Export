import crypto from 'crypto';

export class UserRepository {
  constructor({ encryptionIv, encryptionKey, userModel }) {
    this.encryptionIv = Buffer.from(encryptionIv, 'hex');
    this.encryptionKey = Buffer.from(encryptionKey, 'hex');
    this.userModel = userModel;
  }

  createOrUpdateByStravaAthleteId(stravaAthleteId, user) {
    const userData = JSON.parse(JSON.stringify(user));

    if (userData.stravaToken) {
      if (userData.stravaToken.accessToken) {
        userData.stravaToken.accessToken = this.encrypt(userData.stravaToken.accessToken);
      }

      if (userData.stravaToken.refreshToken) {
        userData.stravaToken.refreshToken = this.encrypt(userData.stravaToken.refreshToken);
      }
    }

    return this.userModel.findOneAndUpdate({ stravaAthleteId }, userData, { new: true, upsert: true }).lean();
  }

  async findById(id) {
    const user = await this.userModel.findById(id).lean();

    if (user && user.stravaToken) {
      if (user.stravaToken.accessToken) {
        user.stravaToken.accessToken = this.decrypt(user.stravaToken.accessToken);
      }

      if (user.stravaToken.refreshToken) {
        user.stravaToken.refreshToken = this.decrypt(user.stravaToken.refreshToken);
      }
    }

    return user;
  }

  updateOneById(id, user) {
    const userData = JSON.parse(JSON.stringify(user));

    if (userData.stravaToken) {
      if (userData.stravaToken.accessToken) {
        userData.stravaToken.accessToken = this.encrypt(userData.stravaToken.accessToken);
      }

      if (userData.stravaToken.refreshToken) {
        userData.stravaToken.refreshToken = this.encrypt(userData.stravaToken.refreshToken);
      }
    }

    return this.userModel.updateOne({ _id: id }, user);
  }

  encrypt(text) {
    const uniqueIv = crypto.randomBytes(4);

    const combinedIv = Buffer.concat([this.encryptionIv, uniqueIv]);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, combinedIv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return uniqueIv.toString('hex') + ':' + encrypted + ':' + authTag;
  }

  decrypt(encryptedText) {
    const [uniqueIv, encrypted, authTag] = encryptedText.split(':');

    const combinedIv = Buffer.concat([
      this.encryptionIv,
      Buffer.from(uniqueIv, 'hex')
    ]);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, combinedIv);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
