/**
 * @group unit
 */

const { addArrayToSchema, addToSchema, createSchemaObject, setTransformers } = require('./schema');

describe('createSchemaObject', () => {
  it('should return the object with a type', () => {
    expect(createSchemaObject('test', { foo: 'bar' })).toStrictEqual({
      foo: 'bar',
      type: 'test',
    });
  });
});

describe('addToSchema', () => {
  it('should return the object with a type and the correct name', () => {
    expect(addToSchema('test')).toStrictEqual({
      test_fuzzy: {
        default: '',
        index: false,
        type: [String],
      },
    });
  });
});

describe('addArrayToSchema', () => {
  it('should return the object with a type and the correct name', () => {
    expect(addArrayToSchema('SomeType')('test')).toStrictEqual({
      test_fuzzy: {
        default: [],
        index: false,
        type: 'SomeType',
      },
    });
  });
});

describe('setTransformers', () => {
  const hideElements = jest.fn();

  it('should call toObject and toJSON transforms when they appear', () => {
    const isFunction = jest.fn().mockImplementation(() => true);
    const schema = {
      options: {
        toObject: {
          some_obj_value: true,
          transform: jest.fn(),
        },
        toJSON: {
          some_json_value: true,
          transform: jest.fn(),
        },
      },
    };
    const { toJSON, toObject } = setTransformers(isFunction)(hideElements)(schema);

    toJSON.transform();
    toObject.transform();

    expect(toJSON).toStrictEqual({
      ...schema.options.toJSON,
      transform: expect.any(Function),
    });
    expect(toObject).toStrictEqual({
      ...schema.options.toObject,
      transform: expect.any(Function),
    });

    expect(schema.options.toObject.transform).toHaveBeenCalledTimes(1);
    expect(schema.options.toJSON.transform).toHaveBeenCalledTimes(1);
  });
});
