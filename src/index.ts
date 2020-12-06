import {
  createFields,
  createNGramsMiddleware,
  setTransformers,
  QueryFuzzySearch,
  StaticFuzzySearch,
} from './helpers';

import {
  MongooseSchema,
  PluginSchemaOptions,
  StaticFuzzyParameters,
  QueryFuzzyParameters,
} from './types';

export { confidenceScore, sort } from './helpers/db/search';
export { MongoosePluginModel } from './types';

export default function (schema: MongooseSchema, { fields, options }: PluginSchemaOptions): void {
  const { indexes, weights } = createFields(schema, fields);
  const { toJSON, toObject } = setTransformers(fields, options);

  schema.index(indexes, { weights, name: 'fuzzy_text' });
  schema.set('toObject', toObject);
  schema.set('toJSON', toJSON);

  schema.pre('save', function (next) {
    createNGramsMiddleware(this, fields, next);
  });

  schema.pre('update', function (next) {
    createNGramsMiddleware(this.getUpdate(), fields, next);
  });

  schema.pre('findOneAndUpdate', function (next) {
    createNGramsMiddleware(this.getUpdate(), fields, next);
  });

  schema.pre('updateMany', function (next) {
    createNGramsMiddleware(this.getUpdate(), fields, next);
  });

  schema.pre('updateOne', function (next) {
    createNGramsMiddleware(this.getUpdate(), fields, next);
  });

  schema.pre('insertMany', function (next, docs) {
    createNGramsMiddleware(docs, fields, next);
  });

  schema.statics.fuzzySearch = function (...args: StaticFuzzyParameters) {
    return new StaticFuzzySearch(...args).search(this);
  };

  schema.query.fuzzySearch = function (...args: QueryFuzzyParameters) {
    return new QueryFuzzySearch(...args).search(this);
  };
}
