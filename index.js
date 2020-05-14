const mongoose = require('mongoose');

const { Model } = mongoose;

const {
  config: { DEFAULT_MIN_SIZE, DEFAULT_PREFIX_ONLY },
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
  if (isObject(item) && item.keys && !Array.isArray(item.keys) && typeof item.keys !== 'string') {
    throw new TypeError('Key must be an array or a string.');
  }
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

  const { fields } = pluginOptions;

  if (!Array.isArray(fields)) {
    throw new TypeError('Fields must be an array.');
  }

  fields.forEach(validateItem);

  const { indexes, weights } = createFields(schema, fields);
  schema.index(indexes, { weights, name: 'fuzzy_text' });

  const hideElements = removeFuzzyElements(fields);
  const { toJSON, toObject } = setTransformers(hideElements)(schema);

  schema.options = {
    ...schema.options,
    toObject,
    toJSON,
  };

  function saveMiddleware(next) {
    if (this) {
      createNGrams(this, fields);
      next();
    }
  }

  function updateMiddleware(next) {
    if (this._update) {
      createNGrams(this._update, fields);
      next();
    }
  }

  function insertMany(next, docs) {
    docs.forEach((doc) => {
      createNGrams(doc, fields);
    });
    next();
  }

  schema.pre('save', saveMiddleware);
  schema.pre('update', updateMiddleware);
  schema.pre('findOneAndUpdate', updateMiddleware);
  schema.pre('insertMany', insertMany);
  schema.pre('updateMany', updateMiddleware);

  schema.statics.fuzzySearch = function (...args) {
    const queryArgs = Object.values(args);
    if (queryArgs.length === 0 || (!isString(queryArgs[0]) && !isObject(queryArgs[0]))) {
      throw new TypeError(
        'Fuzzy Search: First argument is mandatory and must be a string or an object.',
      );
    }

    const queryString = isObject(queryArgs[0]) ? queryArgs[0].query : queryArgs[0];

    if (!queryString) {
      return Model.find.apply(this);
    }

    const { checkPrefixOnly, defaultNgamMinSize } = getDefaultValues(queryArgs[0]);

    const query = nGrams(queryString, false, defaultNgamMinSize, checkPrefixOnly).join(' ');

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
