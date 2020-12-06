import { DocumentToObjectOptions, SchemaOptions } from 'mongoose';
import { setTransformers } from './schema';
import { Fields } from '../../types';

import { removeFuzzyElements } from './fields';

jest.mock('./fields');

describe('setTransformers', () => {
  const fields: Fields = [
    'firstName',
    { keys: ['en', 'it'], name: 'description' },
    { name: 'lastName', weight: 10 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call `removeFuzzyElements` when no options given', () => {
    const { toJSON, toObject } = setTransformers(fields);

    toJSON.transform?.apply(null, [{}, {}, {}]);
    toObject.transform?.apply(null, [{}, {}, {}]);

    expect(removeFuzzyElements).toHaveBeenCalledTimes(2);
  });

  it.each`
    overridedOption
    ${'toObject'}
    ${'toJSON'}
  `(
    'should call `removeFuzzyElements` and `$overridedOption` tranform function',
    ({ overridedOption }: { overridedOption: 'toObject' | 'toJSON' }) => {
      const existedOptions: DocumentToObjectOptions = {
        getters: true,
        virtuals: true,
        transform: jest.fn(),
      };

      const options: SchemaOptions = {
        [overridedOption]: existedOptions,
      };

      const { toJSON, toObject } = setTransformers(fields, options);

      toJSON.transform?.apply(null, [{}, {}, {}]);
      toObject.transform?.apply(null, [{}, {}, {}]);

      expect(removeFuzzyElements).toHaveBeenCalledTimes(2);
      expect(existedOptions.transform).toHaveBeenCalledTimes(1);
      expect(existedOptions.transform).toHaveBeenCalledWith({}, {}, {});
    },
  );

  it('should call `removeFuzzyElements` and both overridden options', () => {
    const existedToJSON: DocumentToObjectOptions = {
      transform: jest.fn(),
    };

    const existedToObject: DocumentToObjectOptions = {
      getters: true,
      virtuals: true,
      transform: jest.fn(),
    };

    const options: SchemaOptions = {
      'toJSON': existedToJSON,
      'toObject': existedToObject,
    };

    const { toJSON, toObject } = setTransformers(fields, options);

    toJSON.transform?.apply(null, [{}, {}, {}]);
    toObject.transform?.apply(null, [{}, {}, {}]);

    expect(removeFuzzyElements).toHaveBeenCalledTimes(2);
    expect(existedToJSON.transform).toHaveBeenCalledTimes(1);
    expect(existedToJSON.transform).toHaveBeenCalledWith({}, {}, {});
    expect(existedToObject.transform).toHaveBeenCalledTimes(1);
    expect(existedToObject.transform).toHaveBeenCalledWith({}, {}, {});
  });
});
