import languageCharacters from './languageCharacters';

describe('languageCharacters', () => {
  it('should return empty string when the attribute is empty string', () => {
    expect(languageCharacters('')).toEqual('');
  });

  it('should return `aggelos` when the given string is `άγγελος`', () => {
    expect(languageCharacters('άγγελος')).toEqual('angelos');
  });

  it('should return `Aggelos` when the given string is `Άγγελος`', () => {
    expect(languageCharacters('Άγγελος')).toEqual('angelos');
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
