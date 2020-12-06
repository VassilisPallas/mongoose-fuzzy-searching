import { nGrams, makeNGrams } from './ngrams';
import { prepareNgrams } from './utils';

jest.mock('./utils');

describe('nGrams', () => {
  const options = prepareNgrams({});

  describe('with default values', () => {
    it('should return empty array without attributes', () => {
      expect(nGrams('', options.minSize, options.prefixOnly)).toStrictEqual([]);
    });

    it('should be equal to ["a"] when the given text is `a`', () => {
      expect(nGrams('a', options.minSize, options.prefixOnly)).toStrictEqual(['a']);
    });

    it('should be equal to `["aa", "aaa"]` when the given text is `aaa`', () => {
      expect(nGrams('aaa', options.minSize, options.prefixOnly)).toStrictEqual(['aa', 'aaa']);
    });

    it('should be equal to `["23", "12", "123"]` when the given text is 123 (as a number)', () => {
      expect(nGrams('123', options.minSize, options.prefixOnly)).toStrictEqual(['23', '12', '123']);
    });

    it('should apply default `prefixOnly` if it is not present', () => {
      expect(nGrams('123', options.minSize)).toStrictEqual(['23', '12', '123']);
    });
  });

  describe('with custom minSize', () => {
    it('should throw an Error when the minSize is negative', () => {
      expect(nGrams.bind(nGrams, 'aaa', -1, options.prefixOnly)).toThrow(
        'minSize must be greater than 0.',
      );
    });

    it('should throw an Error when the minSize is 0', () => {
      expect(nGrams.bind(nGrams, 'aaa', 0, options.prefixOnly)).toThrow(
        'minSize must be greater than 0.',
      );
    });

    it('should return `["aaa"]` when the minSize is 3', () => {
      expect(nGrams('aaa', 3, options.prefixOnly)).toStrictEqual(['aaa']);
    });
  });

  describe('with custom `prefixOnly`', () => {
    it('should return `["aa", "aaa", "aaaa", "aaaaa"]` when the minSize is 3 and prefixOnly to true', () => {
      expect(nGrams('aaaaa', options.minSize, true)).toStrictEqual(['aa', 'aaa', 'aaaa', 'aaaaa']);
    });
  });

  describe('with both values as custom', () => {
    it('should return `["abc","abcd", "abcde", "abcdef", "abcdefg"]` when the minSize is 3 and prefixOnly to true', () => {
      expect(nGrams('abcdefg', 3, true)).toStrictEqual([
        'abc',
        'abcd',
        'abcde',
        'abcdef',
        'abcdefg',
      ]);
    });
  });
});

describe('makeNGrams', () => {
  const options = prepareNgrams({});

  describe('with default minSize', () => {
    it('should return empty array without attribute', () => {
      expect(
        makeNGrams({
          ...options,
          text: '',
        }),
      ).toStrictEqual([]);
    });

    it('should return `["oe", "jo", "joe", "do", "doe"]` with attribute `Joe Doe`', () => {
      expect(
        makeNGrams({
          ...options,
          text: 'Joe Doe',
        }),
      ).toStrictEqual(['oe', 'jo', 'joe', 'do', 'doe', 'joe doe']);
    });
  });

  describe('with specific `minSize`', () => {
    it('should return `["joe", "doe"]` when the minSize is 3', () => {
      expect(
        makeNGrams({
          ...options,
          text: 'Joe Doe',
          escapeSpecialCharacters: false,
          minSize: 3,
        }),
      ).toStrictEqual(['joe', 'doe', 'joe doe']);
    });
  });

  describe('with `prefixOnly`', () => {
    it('should return `["joe", "doe", "joe doe"]` when the minSize is 3', () => {
      expect(
        makeNGrams({
          ...options,
          text: 'Joe Doe',
          escapeSpecialCharacters: false,
          minSize: 3,
          prefixOnly: false,
        }),
      ).toStrictEqual(['joe', 'doe', 'joe doe']);
    });
  });
});
