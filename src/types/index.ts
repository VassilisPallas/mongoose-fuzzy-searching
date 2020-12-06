import * as mongoose from 'mongoose';

type NonEmptyArray<T> = T[] & { 0: T };

export type MongooseCriteria = mongoose.FilterQuery<any> | mongoose.Query<any>;
export type MongooseModel = mongoose.Model<any, any>;
export type MongooseCallback = (err: any, res: any[]) => void;

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
    toJSON?: mongoose.SchemaOptions['toJSON'];
    toObject?: mongoose.SchemaOptions['toObject'];
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

export interface MongooseQueryHelpers<T extends mongoose.Document> {
  fuzzySearch(...args: StaticFuzzyParameters): mongoose.Query<T>;
}

export interface MongoosePluginModel<T extends mongoose.Document>
  extends mongoose.Model<T, MongooseQueryHelpers<T>> {
  fuzzySearch(...args: StaticFuzzyParameters): mongoose.Query<T>;
}
