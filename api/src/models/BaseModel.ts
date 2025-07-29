import { randomUUID } from 'crypto';
import { Document, Schema, SchemaDefinition } from 'mongoose';

export interface BaseDocument extends Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Uses UUID strings instead of MongoDB ObjectIds to provide API-friendly identifiers that don't expose internal
// temporal information. The String type offers flexibility without the MongoDB-specific Schema.Types.UUID complexity
// while maintaining a database-agnostic identifier format.
export const createBaseSchema = <TDocument extends BaseDocument>(definition: SchemaDefinition) => (
  new Schema<TDocument>({
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    ...definition,
  }, {
    timestamps: true,
  })
);
