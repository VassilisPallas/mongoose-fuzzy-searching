import mongoose, { Schema, Document, HookSyncCallback } from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';

import fuzzySearchPlugin, { MongoosePluginModel } from '../../src';

import { Fields, PluginSchemaOptions } from '../../src/types';

const mongod = new MongoMemoryServer();

export type ModelTestOptions = {
  schemaStructure: Record<string, any>;
  pluginFields: Fields;
  pluginSchemaOptions?: PluginSchemaOptions['options'];
  middlewares?: {
    name: 'save' | 'update' | 'findOneAndUpdate' | 'updateMany' | 'updateOne' | 'insertMany';
    fn: HookSyncCallback<any>;
  }[];
};

const getURL = (): Promise<string> => {
  return process.env.MONGO_DB
    ? Promise.resolve('mongodb://localhost:27017/fuzzy-test')
    : mongod.getConnectionString();
};

export const openConnection = async (): Promise<typeof mongoose> => {
  const uri = await getURL();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  };

  mongoose.Promise = global.Promise;
  return mongoose.connect(uri, mongooseOpts);
};

export const closeConnection = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

class TestModel<T extends Document, U> {
  private _model: MongoosePluginModel<T>;

  private _schema: Schema;

  constructor(
    private _name: string,
    { pluginFields, schemaStructure, middlewares, pluginSchemaOptions }: ModelTestOptions,
  ) {
    this.name = _name.replace(/ /g, '_').toLowerCase();
    this._schema = this.createSchema(schemaStructure);
    this.setMiddlewares(middlewares);
    this.setPlugin(pluginFields, pluginSchemaOptions);
    this._model = this.createModel();
  }

  private createSchema(schemaStructure: ModelTestOptions['schemaStructure']): Schema {
    return new Schema(schemaStructure, {
      collection: `fuzzy_searching_test_${this.name}`,
    });
  }

  private createModel() {
    return mongoose.model<T, MongoosePluginModel<T>>(`Model${this.name}`, this.schema);
  }

  private setPlugin(
    fields: ModelTestOptions['pluginFields'],
    pluginSchemaOptions: ModelTestOptions['pluginSchemaOptions'],
  ) {
    this.schema.plugin(fuzzySearchPlugin, {
      fields,
      options: pluginSchemaOptions || {},
    });
  }

  private setMiddlewares(middlewares: ModelTestOptions['middlewares']): void {
    if (!middlewares || !Array.isArray(middlewares)) {
      return;
    }

    middlewares.forEach(({ name, fn }) => {
      this.schema.pre(name, fn);
    });
  }

  private get name(): string {
    return this._name;
  }

  private set name(name: string) {
    this._name = name;
  }

  public get schema(): Schema {
    return this._schema;
  }

  get model(): MongoosePluginModel<T> {
    return this._model;
  }

  public async seed(obj: U): Promise<T> {
    const doc = new this._model(obj);
    return doc.save();
  }

  public async seedMany(arr: U[]): Promise<T[]> {
    return this._model.insertMany(arr);
  }
}

export const createTestModel = <T>(
  name: string,
  modelOptions: ModelTestOptions,
): TestModel<T & Document, T> => new TestModel<T & Document, T>(name, modelOptions);
