/**
 * @group unit
 */

const languageCharacters = require('./languageCharacters');

describe('languageCharacters', () => {
  it('should return empty string when the attribute is undefined', () => {
    expect(languageCharacters()).toEqual('');
  });

  it('should return empty string when the attribute is empty string', () => {
    expect(languageCharacters('')).toEqual('');
  });

  it('should return `asteris` when the given string is `αστέρης`', () => {
    expect(languageCharacters('αστέρης')).toEqual('asteris');
  });

  it('should return `asteris` when the given string is `Αστέρης`', () => {
    expect(languageCharacters('Αστέρης')).toEqual('asteris');
  });

  it('should return `evcharisto` when the given string is `ευχαριστώ`', () => {
    expect(languageCharacters('ευχαριστώ')).toEqual('evcharisto');
  });

  it('should return `alesund` when the given string is `Ålesund`', () => {
    expect(languageCharacters('Atlético Madrid')).toEqual('atletico madrid');
  });

  it('should return `hello` when the given string is `hello`', () => {
    expect(languageCharacters('hello')).toEqual('hello');
  });
});
