/**
 * @group unit
 */

const plugin = require('.');

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
});
