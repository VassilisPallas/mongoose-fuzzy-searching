const {
  Schema: {
    Types: { Mixed: MixedType },
  },
} = require('mongoose');

const config = require('./config');
const languageCharacters = require('./languageCharacters');
const { isObject, isFunction, isString, replaceSymbols } = require('./utils');
const { makeNGrams } = require('./ngrams');
const {
  createFields,
  removeFuzzyElements,
  createNGrams,
  createByFieldType,
} = require('./db/fields');
const { addToSchema, addArrayToSchema, setTransformers } = require('./db/schema');

const createField = createByFieldType(isString, isObject);
const nGrams = makeNGrams(config, replaceSymbols(languageCharacters));

module.exports = {
  config,
  isString,
  isObject,
  isFunction,
  createFields: createFields(addToSchema, addArrayToSchema, createField, MixedType),
  removeFuzzyElements: removeFuzzyElements(createField),
  createNGrams: createNGrams(nGrams, createField),
  setTransformers: setTransformers(isFunction),
  nGrams,
};
