import {
  Schema as MongooseSchema,
  SchemaOptions as MongooseSchemaOptions,
  HookNextFunction,
  DocumentToObjectOptions,
  Query as MongooseQuery,
  FilterQuery as MongooseFilterQuery,
  Model,
  Document as MongooseDocument,
} from 'mongoose';

export type MongooseCriteria = MongooseFilterQuery<any> | MongooseQuery<any>;
export type MongooseCallback = (err: any, res: any[]) => void;
export type MongooseModel = Model<any, any>;
export {
  MongooseSchema,
  MongooseSchemaOptions,
  HookNextFunction,
  DocumentToObjectOptions,
  MongooseFilterQuery,
};

export type Attributes = Record<string, any> | Record<string, any>[];

export type FieldObject = {
  name: string;
  minSize?: number;
  weight?: number;
  prefixOnly?: boolean;
  escapeSpecialCharacters?: boolean;
  keys?: string[] & { 0: string };
};

export type KeyFieldObject = FieldObject & {
  keys: string[] & { 0: string };
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
  extends Model<T, MongooseQueryHelpers<T>> {
  fuzzySearch(...args: StaticFuzzyParameters): MongooseQuery<T>;
}
