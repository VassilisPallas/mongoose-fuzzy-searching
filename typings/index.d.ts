// Type definitions for Mongoose-Fuzzy-Searching 3.0.0
// Project: https://github.com/VassilisPallas/mongoose-fuzzy-searching
// Minimum TypeScript Version: 3.2

import * as mongoose from 'mongoose';

/*
 * Guidelines for maintaining these definitions:
 * - If you spot an error here or there, please submit a PR.
 *   Give some examples/links to documentation if you can.
 *
 * For patches and minor releases:
 * - Browse the changelog at https://github.com/VassilisPallas/mongoose-fuzzy-searching/CHANGELOG.md
 *   and make necessary changes. Afterwards, update the version number at the top so we know
 *   which version we are on.
 */

declare module 'mongoose-fuzzy-searching' {
  type NonEmptyArray<T> = T[] & { 0: T };

  type MongooseCriteria = mongoose.MongooseFilterQuery<any> | mongoose.Query<any>;
  type MongooseCallback = (err: any, res: any[]) => void;
  type MongooseModel = mongoose.Model<any, any>;
  type MongooseSchemaOptions = mongoose.SchemaOptions;
  type MongooseDocument = mongoose.Document;
  type MongooseQuery<T> = mongoose.Query<T>;

  export type Attributes = Record<string, any> | Record<string, any>[];

  export type FieldObject = {
    name: string;
    minSize?: number;
    weight?: number;
    prefixOnly?: boolean;
    escapeSpecialCharacters?: boolean;
    keys?: NonEmptyArray<string>;
  };

  export type KeyFieldObject = FieldObject & {
    keys: NonEmptyArray<string>;
  };

  export type FieldIndexes = {
    indexes: Record<string, string>;
    weights: Record<string, number>;
  };

  export type NgramOptions = {
    text: string;
    escapeSpecialCharacters: boolean;
    minSize: number;
    prefixOnly: boolean;
  };

  export type Fields = Array<string | FieldObject>;

  export type PluginSchemaOptions = {
    fields: Fields;
    options?: {
      toJSON?: MongooseSchemaOptions['toJSON'];
      toObject?: MongooseSchemaOptions['toObject'];
    };
  };

  export type QueryObject = {
    query: string;
    minSize?: number;
    prefixOnly?: boolean;
    exact?: boolean;
  };

  export type Query = string | QueryObject;

  export type FullySearch = {
    query: Query;
    criteria?: MongooseCriteria;
  };

  export type SearchableModel = Pick<MongooseModel, 'find'>;

  export type StaticFuzzyParameters =
    | [Query]
    | [Query, MongooseCriteria]
    | [Query, MongooseCallback]
    | [Query, MongooseCriteria, MongooseCallback];

  export type QueryFuzzyParameters = [Query] | [Query, MongooseCriteria];

  export type QueryFuzzyReturn = {
    query: Query;
    options: MongooseCriteria;
  };

  export type StaticFuzzyReturn = QueryFuzzyReturn & {
    callback?: MongooseCallback;
  };

  export type FuzzyParameters = StaticFuzzyParameters | QueryFuzzyParameters;

  export interface MongooseQueryHelpers<T extends MongooseDocument> {
    fuzzySearch(...args: StaticFuzzyParameters): MongooseQuery<T>;
  }

  export interface MongoosePluginModel<T extends MongooseDocument>
    extends mongoose.Model<T, MongooseQueryHelpers<T>> {
    fuzzySearch(...args: StaticFuzzyParameters): MongooseQuery<T>;
  }
}
