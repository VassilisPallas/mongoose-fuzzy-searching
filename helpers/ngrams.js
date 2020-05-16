const addWholePhrase = (arr, text) => {
  if (text.split(' ').length > 1) {
    return [...arr, text.toLowerCase()];
  }

  return arr;
};

/**
 * Creates sequence of characters taken from the given string.
 * @param {string} text - The string for the sequence.
 * @param {number} minSize - Lower limit to start creating sequence.
 * @param {boolean} prefixOnly -Only return ngrams from start of word.
 * @return {Array} The sequence of characters in Array of Strings.
 */
const nGrams = (constants) => (text, minSize, prefixOnly) => {
  if (minSize == null) {
    minSize = constants.DEFAULT_MIN_SIZE;
  }

  const set = new Set();
  let index;

  if (minSize <= 0) {
    throw new Error('minSize must be greater than 0.');
  }

  if (!text) {
    return [];
  }

  text = text.slice ? text.toLowerCase() : String(text);
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

/**
 * Creates sequence of each word from the given string.
 * @param {string} text - The string for the sequence.
 * @param {boolean} escapeSpecialCharacters - Escape special characters from the given string.
 * @param {number} minSize - Lower limit to start creating sequence.
 * @param {boolean} prefixOnly -Only return ngrams from start of word.
 * @return {Array} The sequence of characters in Array of Strings.
 */
const makeNGrams = (constants, replaceSymbols) => (
  text,
  escapeSpecialCharacters,
  minSize,
  prefixOnly,
) => {
  if (!text) {
    return [];
  }

  const result = text
    .split(' ')
    .map((q) =>
      nGrams(constants)(
        replaceSymbols(q, escapeSpecialCharacters),
        minSize || constants.DEFAULT_MIN_SIZE,
        prefixOnly || constants.DEFAULT_PREFIX_ONLY,
      ),
    )
    .reduce((acc, arr) => acc.concat(arr), []);
  return addWholePhrase(Array.from(new Set(result)), text);
};

module.exports = { nGrams, makeNGrams };
