// Type definitions for Mongoose-Fuzzy-Searching 3.0.0
// Project: https://github.com/VassilisPallas/mongoose-fuzzy-searching
// Minimum TypeScript Version: 3.2

// import * as mongoose from 'mongoose';

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

// declare module 'mongoose-fuzzy-searching' {
//   type NonEmptyArray<T> = T[] & { 0: T };

//   type MongooseCriteria = mongoose.MongooseFilterQuery<any> | mongoose.Query<any>;
//   type MongooseCallback = (err: any, res: any[]) => void;
//   type MongooseModel = mongoose.Model<any, any>;
//   type MongooseSchema = mongoose.Schema;
//   type MongooseSchemaOptions = mongoose.SchemaOptions;
//   type MongooseDocument = mongoose.Document;
//   type MongooseQuery<T> = mongoose.Query<T>;

//   export type Attributes = Record<string, any> | Record<string, any>[];

//   export type FieldObject = {
//     name: string;
//     minSize?: number;
//     weight?: number;
//     prefixOnly?: boolean;
//     escapeSpecialCharacters?: boolean;
//     keys?: NonEmptyArray<string>;
//   };

//   export type KeyFieldObject = FieldObject & {
//     keys: NonEmptyArray<string>;
//   };

//   export type FieldIndexes = {
//     indexes: Record<string, string>;
//     weights: Record<string, number>;
//   };

//   export type NgramOptions = {
//     text: string;
//     escapeSpecialCharacters: boolean;
//     minSize: number;
//     prefixOnly: boolean;
//   };

//   export type Fields = Array<string | FieldObject>;

//   export type PluginSchemaOptions = {
//     fields: Fields;
//     options?: {
//       toJSON?: MongooseSchemaOptions['toJSON'];
//       toObject?: MongooseSchemaOptions['toObject'];
//     };
//   };

//   export type QueryObject = {
//     query: string;
//     minSize?: number;
//     prefixOnly?: boolean;
//     exact?: boolean;
//   };

//   export type Query = string | QueryObject;

//   export type FullySearch = {
//     query: Query;
//     criteria?: MongooseCriteria;
//   };

//   export type SearchableModel = Pick<MongooseModel, 'find'>;

//   export type StaticFuzzyParameters =
//     | [Query]
//     | [Query, MongooseCriteria]
//     | [Query, MongooseCallback]
//     | [Query, MongooseCriteria, MongooseCallback];

//   export type QueryFuzzyParameters = [Query] | [Query, MongooseCriteria];

//   export type QueryFuzzyReturn = {
//     query: Query;
//     options: MongooseCriteria;
//   };

//   export type StaticFuzzyReturn = QueryFuzzyReturn & {
//     callback?: MongooseCallback;
//   };

//   export type FuzzyParameters = StaticFuzzyParameters | QueryFuzzyParameters;

//   export interface MongooseQueryHelpers<T extends MongooseDocument> {
//     fuzzySearch(...args: StaticFuzzyParameters): MongooseQuery<T>;
//   }

//   export interface MongoosePluginModel<T extends MongooseDocument>
//     extends mongoose.Model<T, MongooseQueryHelpers<T>> {
//     fuzzySearch(query: Query): MongooseQuery<T>;
//     fuzzySearch(query: Query, options: MongooseCriteria): MongooseQuery<T>;
//     fuzzySearch(query: Query, callback: MongooseCallback): MongooseQuery<T>;
//     fuzzySearch(
//       query: Query,
//       options: MongooseCriteria,
//       callback: MongooseCallback,
//     ): MongooseQuery<T>;
//   }

//   export default function (schema: MongooseSchema, { fields, options }: PluginSchemaOptions): void;

//   export const confidenceScore: any;
// }

declare module 'mongoose' {
  type NonEmptyArray<T> = T[] & { 0: T };

  export type FieldObject = {
    name: string;
    minSize?: number;
    weight?: number;
    prefixOnly?: boolean;
    escapeSpecialCharacters?: boolean;
    keys?: NonEmptyArray<string>;
  };

  export type Fields = Array<string | FieldObject>;

  export interface FuzzySearchOptions {
    fields: Fields;
    options?: {
      toJSON?: SchemaOptions['toJSON'];
      toObject?: SchemaOptions['toObject'];
    };
  }

  export type QueryObject = {
    query: string;
    minSize?: number;
    prefixOnly?: boolean;
    exact?: boolean;
  };

  export type PluginQuery = string | QueryObject;

  type MongooseCriteria = MongooseFilterQuery<any> | Query<any>;
  type MongooseCallback = (err: any, res: any[]) => void;

  export interface MongooseQueryHelpers<T extends Document> {
    fuzzySearch(query: PluginQuery): Query<T>;
    fuzzySearch(query: PluginQuery, options: MongooseCriteria): Query<T>;
    fuzzySearch(query: PluginQuery, cb: MongooseCallback): Query<T>;
    fuzzySearch(query: PluginQuery, options: MongooseCriteria, cb: MongooseCallback): Query<T>;
  }

  export interface MongoosePluginModel<T extends Document>
    extends Model<T, MongooseQueryHelpers<T>> {
    fuzzySearch(query: PluginQuery): Query<T>;
    fuzzySearch(query: PluginQuery, options: MongooseCriteria): Query<T>;
    fuzzySearch(query: PluginQuery, cb: MongooseCallback): Query<T>;
    fuzzySearch(query: PluginQuery, options: MongooseCriteria, cb: MongooseCallback): Query<T>;
  }

  export function model<T extends Document>(
    name: string,
    schema?: Schema<FuzzySearchOptions>,
    collection?: string,
    skipInit?: boolean,
  ): MongoosePluginModel<T>;
}

declare module 'mongoose-fuzzy-searching' {
  import mongoose = require('mongoose');
  const _: (schema: mongoose.Schema, Options?: mongoose.FuzzySearchOptions) => void;

  export default _;
}
