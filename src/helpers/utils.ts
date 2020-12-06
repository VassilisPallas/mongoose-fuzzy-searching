import config from '../config';
import { NgramOptions, QueryObject } from '../types';
import languageCharacters from './languageCharacters';

export const replaceSymbols = (text: string, escapeSpecialCharacters: boolean): string => {
  text = text.toLowerCase();
  if (escapeSpecialCharacters) {
    text = text.replace(/[!"#%&'()*+,-./:;<=>?@[\\\]^`{|}~]/g, ''); // remove special characters
  }
  text = text.replace(/_/g, ' ');
  text = languageCharacters(text);

  return text;
};

export const isObject = (obj: any): boolean =>
  !!obj && obj.constructor === Object && Object.keys(obj).length > 0;

export const isFunction = (fn: unknown): boolean =>
  !!(fn && (typeof fn === 'function' || fn instanceof Function));

export const isString = (input: unknown): boolean =>
  typeof input === 'string' || input instanceof String;

export const prepareNgrams = (ngramsOptions: Partial<NgramOptions>): NgramOptions => {
  const { escapeSpecialCharacters, minSize, prefixOnly, text } = ngramsOptions;

  return {
    escapeSpecialCharacters: escapeSpecialCharacters || config.ESCAPE_SPECIAL_CHARACTERS,
    minSize: minSize || config.DEFAULT_MIN_SIZE,
    prefixOnly: prefixOnly || config.DEFAULT_PREFIX_ONLY,
    text: text || '',
  };
};

export const prepareQuery = (query: string, options?: Partial<QueryObject>): QueryObject => ({
  query,
  exact: options?.exact || config.DEFAULT_EXACT_SEARCH,
  prefixOnly: options?.prefixOnly || config.DEFAULT_PREFIX_ONLY,
  minSize: options?.minSize || config.DEFAULT_MIN_SIZE,
});
