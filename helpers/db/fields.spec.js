/**
 * @group unit
 */

const { createByFieldType, createFields, createNGrams, removeFuzzyElements } = require('./fields');

describe('createByFieldType', () => {
  let isString;
  let isObject;
  const obj = {
    fromString: jest.fn(),
    fromObjectKeys: jest.fn(),
    fromObject: jest.fn(),
  };

  it('should call fromString function when text is string', () => {
    isString = () => true;
    isObject = () => false;

    createByFieldType(isString, isObject)(obj)('test');
    expect(obj.fromString).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when object is neither a string nor an object', () => {
    isString = () => false;
    isObject = () => false;

    expect(createByFieldType(isString, isObject)(obj).bind(createByFieldType, 'test')).toThrow(
      'Fields items must be String or Object.',
    );
  });

  it('should call fromObjectKeys when item is an object and contains a keys attribute', () => {
    isString = () => false;
    isObject = () => true;

    createByFieldType(isString, isObject)(obj)({ keys: 'test' });
    expect(obj.fromObjectKeys).toHaveBeenCalledTimes(1);
  });

  it("should call fromObjectKeys when item is an object and doesn't contain a keys attribute", () => {
    isString = () => false;
    isObject = () => true;

    createByFieldType(isString, isObject)(obj)({ name: 'test' });
    expect(obj.fromObject).toHaveBeenCalledTimes(1);
  });
});

describe('createFields', () => {
  let createField;
  let fields;

  const addToSchema = jest.fn();
  const addArrayToSchema = () => jest.fn();
  const MixedType = 'type';

  const schema = {
    add: jest.fn(),
    index: jest.fn(),
  };

  it('should create the fields', () => {
    fields = [
      'test',
      { keys: ['key_test_1', 'key_test_2'], name: 'some__key_name' },
      { name: 'some_name', weight: 10 },
    ];

    createField = (obj) => (item, index) => {
      if (index === 0) {
        obj.fromString(item);
      } else if (index === 1) {
        obj.fromObjectKeys(item);
      } else {
        obj.fromObject(item);
      }
    };

    const { indexes, weights } = createFields(
      addToSchema,
      addArrayToSchema,
      createField,
      MixedType,
    )(schema, fields);

    expect(indexes).toStrictEqual({
      test_fuzzy: 'text',
      'some__key_name_fuzzy.key_test_1_fuzzy': 'text',
      'some__key_name_fuzzy.key_test_2_fuzzy': 'text',
      some_name_fuzzy: 'text',
    });
    expect(weights).toStrictEqual({ some_name_fuzzy: 10 });
  });
});

describe('removeFuzzyElements', () => {
  let createField;
  let fields;

  it('should remove the fields', () => {
    fields = ['test', { name: 'some_name', weight: 10 }];

    createField = (obj) => (item, index) => {
      if (index === 0) {
        obj.fromString(item);
      } else if (index === 1) {
        obj.fromObject(item);
      }
    };

    const ret = {
      test_fuzzy: '1234',
      some_name_fuzzy: '5678',
      some_other: 'qwerty',
    };

    expect(removeFuzzyElements(createField)(fields)({}, ret)).toStrictEqual({
      some_other: 'qwerty',
    });
  });
});

describe('createNGrams', () => {
  let createField;
  let fields;
  let attributes;

  const makeNGrams = jest.fn().mockImplementation((t) => t);

  it('should store ngrams to fuzzy attributes', () => {
    attributes = {
      test: 'test',
      some_name: 'some_name',
      some__key_name: {
        key_test_1: '1234',
        key_test_2: '1234',
      },
    };
    fields = [
      'test',
      { keys: ['key_test_1', 'key_test_2'], name: 'some__key_name' },
      { name: 'some_name', weight: 10 },
    ];

    createField = (obj) => (item, index) => {
      if (index === 0) {
        obj.fromString(item);
      } else if (index === 1) {
        obj.fromObjectKeys(item);
      } else {
        obj.fromObject(item);
      }
    };

    createNGrams(makeNGrams, createField)(attributes, fields);
    expect(attributes).toStrictEqual({
      test: 'test',
      some_name: 'some_name',
      some__key_name: {
        key_test_1: '1234',
        key_test_2: '1234',
      },
      test_fuzzy: 'test',
      some_name_fuzzy: 'some_name',
      some__key_name_fuzzy: [
        {
          key_test_1_fuzzy: '1234',
          key_test_2_fuzzy: '1234',
        },
      ],
    });
  });

  it('should not create ngrams if attributes is undefined', () => {
    attributes = undefined;
    fields = [
      'test',
      { keys: ['key_test_1', 'key_test_2'], name: 'some__key_name' },
      { name: 'some_name', weight: 10 },
    ];

    createField = (obj) => (item, index) => {
      if (index === 0) {
        obj.fromString(item);
      } else if (index === 1) {
        obj.fromObjectKeys(item);
      } else {
        obj.fromObject(item);
      }
    };

    createNGrams(makeNGrams, createField)(attributes, fields);
    expect(attributes).toStrictEqual(undefined);
  });
});
