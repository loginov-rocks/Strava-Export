import { createHash, randomInt } from 'crypto';

// TODO: Consider better naming for the module and functions.

export const createSha256Hash = (value: string) => createHash('sha256').update(value).digest('hex');

export const generateRandomAlphaNumericString = (length: number) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  return Array.from({ length }, () => (
    charset[randomInt(0, charset.length)]
  )).join('');
};
