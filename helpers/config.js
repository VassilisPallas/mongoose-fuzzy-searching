/**
 * Reusable constant values
 * @typedef {Object} constants
 * @property {number} DEFAULT_MIN_SIZE - Default min size for anagrams.
 * @property {boolean} DEFAULT_PREFIX_ONLY - Whether return ngrams from start of word or not
 */

module.exports = {
  DEFAULT_MIN_SIZE: 2,
  DEFAULT_PREFIX_ONLY: false,
  validMiddlewares: [
    'preSave',
    'preUpdate',
    'preFindOneAndUpdate',
    'preInsertMany',
    'preUpdateMany',
    'preUpdateOne',
  ],
};
