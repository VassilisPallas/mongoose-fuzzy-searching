/**
 * Removes special symbols from string.
 * @param {string} text - The string to remove the characters.
 * @param {boolean} escapeSpecialCharacters - If this value is true, it will also remove all the special characters.
 * @return {string} the given text without the special characters.
 */
const replaceSymbols = (replaceLanguageCharacters) => (text, escapeSpecialCharacters) => {
  text = text.toLowerCase();
  if (escapeSpecialCharacters) {
    text = text.replace(/[!"#%&'()*+,-./:;<=>?@[\\\]^`{|}~]/g, ''); // remove special characters
  }
  text = text.replace(/_/g, ' ');
  text = replaceLanguageCharacters(text);

  return text;
};

/**
 * Returns if the variable is an object and if the the object is empty
 * @param {any} obj
 * @return {boolean}
 */
const isObject = (obj) => !!obj && obj.constructor === Object && Object.keys(obj).length > 0;

/**
 * Returns if the variable is a Function
 * @param {any} fn
 * @return {boolean}
 */
const isFunction = (fn) => !!(fn && (typeof fn === 'function' || fn instanceof Function));

const isString = (input) => typeof input === 'string' || input instanceof String;

module.exports = {
  replaceSymbols,
  isObject,
  isFunction,
  isString,
};
