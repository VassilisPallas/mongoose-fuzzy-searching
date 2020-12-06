import { createNGramsMiddleware } from './middlewares';

import * as DatabaseFields from './db/fields';

jest.mock('./db/fields');

describe('createNGramsMiddleware', () => {
  const next = jest.fn();

  it('should call `createNGrams` for each element on the array', () => {
    const doc = [
      {
        name: 'Joe',
      },
      {
        name: 'Joe',
      },
      {
        name: 'Joe',
      },
      {
        name: 'Joe',
      },
    ];

    const fields = ['name'];

    const createNGramsMock = jest.spyOn(DatabaseFields, 'createNGrams');

    createNGramsMiddleware(doc, fields, next);

    expect(createNGramsMock).toHaveBeenCalledTimes(doc.length);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call `createNGrams` for a single object', () => {
    const doc = {
      name: 'Joe',
    };

    const fields = ['name'];

    const createNGramsMock = jest.spyOn(DatabaseFields, 'createNGrams');

    createNGramsMiddleware(doc, fields, next);

    expect(createNGramsMock).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call next with error when an Error is thrown', () => {
    const doc = {
      name: 'Joe',
    };

    const fields = ['name'];

    const error = new Error('oops');

    const createNGramsMock = jest.spyOn(DatabaseFields, 'createNGrams').mockImplementation(() => {
      throw error;
    });

    createNGramsMiddleware(doc, fields, next);

    expect(createNGramsMock).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});
