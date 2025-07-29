import { Model, UpdateQuery } from 'mongoose';

import { BaseDocument } from '../models/BaseModel';

export abstract class BaseRepository<TData, TDocument extends BaseDocument & TData> {
  protected readonly model: Model<TDocument>;

  constructor({ model }: { model: Model<TDocument> }) {
    this.model = model;
  }

  public async create(data: TData) {
    return this.model.create(data);
  }

  public async createMany(data: TData[]) {
    return this.model.insertMany(data);
  }

  public async deleteById(id: string) {
    return this.model.deleteOne({ _id: id });
  }

  public async findById(id: string) {
    return this.model.findById(id);
  }

  public async updateById(id: string, data: Partial<TData>) {
    return this.model.updateOne({ _id: id }, data as UpdateQuery<TDocument>);
  }
}
