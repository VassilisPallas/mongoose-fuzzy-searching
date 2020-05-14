const mongoose = require('mongoose');

const { Schema } = mongoose;

let dbNum = 0;

const openConnection = () => {
  mongoose.Promise = global.Promise;
  mongoose.set('useCreateIndex', true);
  return mongoose.connect(process.env.MONGO_TEST_URL || 'mongodb://localhost:27017/fuzzy-test', {
    useNewUrlParser: true,
  });
};

const closeConnection = () => mongoose.disconnect();

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

const dropDatabase = () => mongoose.connection.dropDatabase();

module.exports = {
  openConnection,
  closeConnection,
  createSchema,
  seed,
  dropDatabase,
};
