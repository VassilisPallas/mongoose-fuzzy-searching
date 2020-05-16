const mongoose = require('mongoose');

const { Model } = mongoose;

const {
  config: { DEFAULT_MIN_SIZE, DEFAULT_PREFIX_ONLY, validMiddlewares },
  createFields,
  createNGrams,
  isFunction,
  isObject,
  isString,
  removeFuzzyElements,
  setTransformers,
  nGrams,
} = require('./helpers');

const parseArguments = (args, i1, i2) => {
  let options = {};
  let callback = null;

  if (args[i1] && isFunction(args[i1])) {
    callback = args[i1];
  } else if (args[i1] && isObject(args[i1])) {
    options = args[i1];
  }

  if (!callback && typeof args[i2] === 'function') {
    callback = args[i2];
  }

  return { options, callback };
};

const validateItem = (item) => {
  if (isObject(item) && item.keys && !Array.isArray(item.keys) && !isString(item.keys)) {
    throw new TypeError('Key must be an array or a string.');
  }
};

const validateMiddlewares = (middlewares) => {
  if (!middlewares) {
    return;
  }

  if (!isObject(middlewares)) {
    throw new TypeError('Middlewares must be an object.');
  }

  if (!Object.keys(middlewares).every((key) => validMiddlewares.includes(key))) {
    throw new TypeError(`Middleware key should be one of: [${validMiddlewares.join(', ')}].`);
  }

  if (!Object.values(middlewares).every(isFunction)) {
    throw new TypeError('Middleware must be a Function.');
  }
};

const getMiddleware = (middlewares, name) => {
  return middlewares && middlewares[name] ? middlewares[name] : null;
};

const getDefaultValues = (item) => {
  const checkPrefixOnly = isObject(item) ? item.prefixOnly : DEFAULT_PREFIX_ONLY;

  const defaultNgamMinSize = isObject(item) ? item.minSize : DEFAULT_MIN_SIZE;

  return {
    checkPrefixOnly,
    defaultNgamMinSize,
  };
};

/**
 * Plugin's main function. Creates the fuzzy fields on the collection, set's a pre save middleware to create the Ngrams for the fuzzy fields
 * and creates the instance methods `fuzzySearch` which finds the guesses.
 * @param {object} schema - Mongo Collection
 * @param {object} options - plugin options
 */
module.exports = function (schema, pluginOptions) {
  if (!pluginOptions || (pluginOptions && !pluginOptions.fields)) {
    throw new Error('You must set at least one field for fuzzy search.');
  }

  const { fields, middlewares } = pluginOptions;

  if (!Array.isArray(fields)) {
    throw new TypeError('Fields must be an array.');
  }

  fields.forEach(validateItem);
  validateMiddlewares(middlewares);

  const { indexes, weights } = createFields(schema, fields);
  schema.index(indexes, { weights, name: 'fuzzy_text' });

  const hideElements = removeFuzzyElements(fields);
  const { toJSON, toObject } = setTransformers(hideElements)(schema);

  schema.options = {
    ...schema.options,
    toObject,
    toJSON,
  };

  function thenable(fn, cb, attr) {
    if (!fn) {
      return cb();
    }

    return Promise.resolve(fn.bind(this)(attr)).then(cb);
  }

  function saveMiddleware(next) {
    const attributes = this;
    return function () {
      createNGrams(attributes, fields);
      next();
    };
  }

  function updateMiddleware(next) {
    const attributes = this._update;
    return function () {
      createNGrams(attributes, fields);
      next();
    };
  }

  function insertMany(next, docs) {
    return function () {
      docs.forEach((doc) => {
        createNGrams(doc, fields);
      });
      next();
    };
  }

  function preUpdate(fnName) {
    const fn = getMiddleware(middlewares, fnName);
    return function (next) {
      return thenable.bind(this)(fn, updateMiddleware.bind(this)(next));
    };
  }

  schema.pre('save', function (next) {
    const fn = getMiddleware(middlewares, 'preSave');
    return thenable.bind(this)(fn, saveMiddleware.bind(this)(next));
  });

  schema.pre('insertMany', function (next, docs) {
    const fn = getMiddleware(middlewares, 'preInsertMany');
    return thenable.bind(this)(fn, insertMany.bind(this)(next, docs), docs);
  });

  schema.pre('update', preUpdate('preUpdate'));

  schema.pre('updateOne', preUpdate('preUpdateOne'));

  schema.pre('findOneAndUpdate', preUpdate('preFindOneAndUpdate'));

  schema.pre('updateMany', preUpdate('preUpdateMany'));

  schema.statics.fuzzySearch = function (...args) {
    const queryArgs = Object.values(args);
    if (queryArgs.length === 0 || (!isString(queryArgs[0]) && !isObject(queryArgs[0]))) {
      throw new TypeError(
        'Fuzzy Search: First argument is mandatory and must be a string or an object.',
      );
    }

    const queryString = isObject(queryArgs[0]) ? queryArgs[0].query : queryArgs[0];
    const exact = isObject(queryArgs[0]) ? !!queryArgs[0].exact : false;

    if (!queryString) {
      return Model.find.apply(this);
    }

    const { checkPrefixOnly, defaultNgamMinSize } = getDefaultValues(queryArgs[0]);

    const query = exact
      ? `"${queryString}"`
      : nGrams(queryString, false, defaultNgamMinSize, checkPrefixOnly).join(' ');

    const { callback, options } = parseArguments(queryArgs, 1, 2);

    let search;

    if (!isObject(options)) {
      search = {
        $text: {
          $search: query,
        },
      };
    } else {
      search = {
        $and: [{ $text: { $search: query } }, options],
      };
    }

    return Model.find.apply(this, [
      search,
      { confidenceScore: { $meta: 'textScore' } },
      { sort: { confidenceScore: { $meta: 'textScore' } } },
      callback,
    ]);
  };
};
