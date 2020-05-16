/**
 * @group unit
 */

const { nGrams, makeNGrams } = require('./ngrams');

const constant = { DEFAULT_MIN_SIZE: 2, DEFAULT_PREFIX_ONLY: false };

describe('nGrams', () => {
  describe('with default minSize', () => {
    it('should return empty array without attribute', () => {
      expect(nGrams(constant)()).toStrictEqual([]);
    });

    it('should be equal to ["a"] when the given text is `a`', () => {
      expect(nGrams(constant)('a')).toStrictEqual(['a']);
    });

    it('should be equal to `["aa", "aaa"]` when the given text is `aaa`', () => {
      expect(nGrams(constant)('aaa')).toStrictEqual(['aa', 'aaa']);
    });

    it('should be equal to `["23", "12", "123"]` when the given text is 123 (as a number)', () => {
      expect(nGrams(constant)(123)).toStrictEqual(['23', '12', '123']);
    });
  });

  describe('with specific minSize', () => {
    it('should throw an Error when the minSize is negative', () => {
      expect(nGrams(constant).bind(nGrams, 'aaa', -1)).toThrow('minSize must be greater than 0.');
    });

    it('should throw an Error when the minSize is 0', () => {
      expect(nGrams(constant).bind(nGrams, 'aaa', 0)).toThrow('minSize must be greater than 0.');
    });

    it('should return `["aaa"]` when the minSize is 3', () => {
      expect(nGrams(constant)('aaa', 3)).toStrictEqual(['aaa']);
    });

    it('should return `["aaa","aaaa", "aaaaa"]` when the minSize is 3 and prefixOnly to true', () => {
      expect(nGrams(constant)('aaaaa', 3, true)).toStrictEqual(['aaa', 'aaaa', 'aaaaa']);
    });
  });
});

describe('makeNGrams', () => {
  const replaceSymbols = (text) => text;

  describe('with default minSize', () => {
    it('should return empty array without attribute', () => {
      expect(makeNGrams(constant, replaceSymbols)()).toStrictEqual([]);
    });

    it('should return `["oe", "jo", "joe", "do", "doe"]` with attribute `Joe Doe`', () => {
      expect(makeNGrams(constant, replaceSymbols)('Joe Doe')).toStrictEqual([
        'oe',
        'jo',
        'joe',
        'do',
        'doe',
        'joe doe',
      ]);
    });
  });

  describe('with specific `minSize`', () => {
    it('should return `["joe", "doe"]` when the minSize is 3', () => {
      expect(makeNGrams(constant, replaceSymbols)('Joe Doe', false, 3)).toStrictEqual([
        'joe',
        'doe',
        'joe doe',
      ]);
    });
  });

  describe('with `prefixOnly`', () => {
    it('should return `["joe", "doe"]` when the minSize is 3', () => {
      expect(makeNGrams(constant, replaceSymbols)('Joe Doe', false, 2, false)).toStrictEqual([
        'oe',
        'jo',
        'joe',
        'do',
        'doe',
        'joe doe',
      ]);
    });
  });
});
