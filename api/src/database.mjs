import mongoose from 'mongoose';

export const connect = (mongooseConnectUri) => {
  return mongoose.connect(mongooseConnectUri);
};
