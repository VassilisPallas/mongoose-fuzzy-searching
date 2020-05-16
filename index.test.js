/**
 * @group unit
 */

const plugin = require('.');
const { validMiddlewares } = require('./helpers/config');

describe('fuzzy search', () => {
  const schema = {
    add: () => {},
    index: () => {},
    set: () => {},
    pre: () => {},
    statics: [],
  };

  it('should throw an Error when the options attribute is undefined', () => {
    expect(plugin.bind(this)).toThrow('You must set at least one field for fuzzy search.');
  });

  it('should throw an Error when the fields option is undefined', () => {
    expect(plugin.bind(this, schema, {})).toThrow(
      'You must set at least one field for fuzzy search.',
    );
  });

  it('should throw an TypeError when the fields option is not an array', () => {
    expect(plugin.bind(this, schema, { fields: '123' })).toThrow('Fields must be an array');
  });

  it('should return TypeError when keys is not a String or an Array', () => {
    expect(
      plugin.bind(this, schema, {
        fields: [
          {
            keys: () => {},
          },
        ],
      }),
    ).toThrow('Key must be an array or a string.');
  });

  it('should return TypeError when middlewares are not an Object', () => {
    expect(
      plugin.bind(this, schema, {
        fields: ['name'],
        middlewares: [1, 2, 3],
      }),
    ).toThrow('Middlewares must be an object.');
  });

  it('should return TypeError when a middleware is not a function', () => {
    expect(
      plugin.bind(this, schema, {
        fields: ['name'],
        middlewares: {
          preSave: () => {},
          preUpdate: 'test',
        },
      }),
    ).toThrow('Middleware must be a Function.');
  });

  it('should return TypeError when a middleware key is invalid', () => {
    expect(
      plugin.bind(this, schema, {
        fields: ['name'],
        middlewares: {
          preSave: () => {},
          somethingElse: () => {},
        },
      }),
    ).toThrow(`Middleware key should be one of: [${validMiddlewares.join(', ')}].`);
  });
});
