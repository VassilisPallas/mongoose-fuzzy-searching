const createSchemaObject = (typeValue, options) => ({
  ...options,
  type: typeValue,
});

const addToSchema = (name) => ({
  [`${name}_fuzzy`]: createSchemaObject([String], {
    default: '',
    index: false,
  }),
});

const addArrayToSchema = (MixedType) => (name) => ({
  [`${name}_fuzzy`]: createSchemaObject(MixedType, {
    default: [],
    index: false,
  }),
});

const setTransformers = (isFunction) => (hideElements) => (schema) => {
  let toObjectTransform;
  let toJSONTransform;

  if (schema.options.toObject && schema.options.toObject.transform) {
    toObjectTransform = schema.options.toObject.transform;
  }

  if (schema.options.toJSON && schema.options.toJSON.transform) {
    toJSONTransform = schema.options.toJSON.transform;
  }

  const toObject = {
    ...(schema.options.toObject || {}),
    transform: (...args) => {
      if (isFunction(toObjectTransform)) {
        toObjectTransform(...args);
      }
      return hideElements(...args);
    },
  };

  const toJSON = {
    ...(schema.options.toJSON || {}),
    transform: (...args) => {
      if (isFunction(toJSONTransform)) {
        toJSONTransform(...args);
      }
      return hideElements(...args);
    },
  };

  return { toObject, toJSON };
};

module.exports = {
  createSchemaObject,
  addToSchema,
  addArrayToSchema,
  setTransformers,
};
