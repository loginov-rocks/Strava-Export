import mongoose from 'mongoose';

export const connect = (mongooseConnectUri: string) => {
  return mongoose.connect(mongooseConnectUri);
};
