const mongoose = require('mongoose');

const { Schema } = mongoose;

const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

let dbNum = 0;

const openConnection = async () => {
  const uri = await mongod.getConnectionString();

  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useUnifiedTopology: true,
  };

  mongoose.Promise = global.Promise;
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  return mongoose.connect(uri, mongooseOpts);
};

const closeConnection = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

const createSchema = (schemaStructure, options = {}) => (plugin, fields) => {
  const schema = new Schema(schemaStructure, {
    collection: `fuzzy_searching_test_${++dbNum}`,
    ...options,
  });
  schema.plugin(plugin, {
    fields,
  });

  return mongoose.model(`Model${dbNum}`, schema);
};

const seed = (Model, obj) => {
  const doc = new Model(obj);
  return doc.save();
};

module.exports = {
  openConnection,
  closeConnection,
  createSchema,
  seed,
};
