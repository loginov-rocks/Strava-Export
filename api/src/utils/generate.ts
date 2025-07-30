import { createHash, randomInt } from 'crypto';

export const generateCodeChallenge = (codeVerifier: string): string => (
  createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
);

export const generateRandomString = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  return Array.from({ length }, () => (
    charset[randomInt(0, charset.length)]
  )).join('');
};

export const generateSha256 = (value: string): string => (
  createHash('sha256')
    .update(value)
    .digest('hex')
);
