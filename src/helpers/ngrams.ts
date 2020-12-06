import { replaceSymbols } from './utils';
import { NgramOptions } from '../types';

const addWholePhrase = (arr: string[], text: string) => {
  if (text.split(' ').length > 1) {
    return [...arr, text.toLowerCase()];
  }

  return arr;
};

/**
 * Creates sequence of characters taken from the given string.
 * @param  text - The string for the sequence.
 * @param  minSize - Lower limit to start creating sequence.
 * @param  prefixOnly -Only return ngrams from start of word.
 * @return The sequence of characters in array of strings.
 */
export const nGrams = (text: string, minSize: number, prefixOnly = false): string[] => {
  const set = new Set<string>();
  let index: number;

  if (minSize <= 0) {
    throw new Error('minSize must be greater than 0.');
  }

  if (!text) {
    return [];
  }

  text = text.toLowerCase();
  index = prefixOnly ? 0 : text.length - minSize + 1;

  if (text.length <= minSize) {
    return [text];
  }

  if (prefixOnly) {
    while (minSize < text.length + 1) {
      set.add(text.slice(index, index + minSize));
      minSize++;
    }

    return Array.from(set);
  }

  while (minSize <= text.length + 1) {
    if (index !== 0) {
      set.add(text.slice(--index, index + minSize));
    } else {
      minSize++;
      index = text.length - minSize + 1;
    }
  }

  return Array.from(set);
};

export const makeNGrams = ({
  text,
  escapeSpecialCharacters,
  minSize,
  prefixOnly,
}: NgramOptions): string[] => {
  if (!text) {
    return [];
  }

  const result: string[] = text
    .split(' ')
    .map((q) => {
      const cleanText: string = replaceSymbols(q, escapeSpecialCharacters);
      return nGrams(cleanText, minSize, prefixOnly);
    })
    .reduce((acc, arr) => acc.concat(arr), []);

  return addWholePhrase(Array.from(new Set(result)), text);
};
