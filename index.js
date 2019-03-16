'use strict';

var mongoose = require('mongoose');
var Model = mongoose.Model;
var replaceLanguageCharacters = require('./languageCharacters');

function nGrams(text, minSize) {
    if (minSize === undefined || minSize === null) {
        minSize = 2;
    }

    var set = new Set();
    var index;

    if (minSize <= 0) {
        throw new Error('minSize must be greater than 0.');
    }

    if (!text) {
        return [];
    }

    text = text.slice ? text.toLowerCase() : String(text);
    index = text.length - minSize + 1;

    if (index < 1) {
        return [];
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
}

function replaceSymbols(text, escapeSpecialCharacters) {
    text = text.toLowerCase();
    if (escapeSpecialCharacters) {
        text = text.replace(/[!\"#%&\'\(\)\*\+,-\.\/:;<=>?@\[\\\]\^`\{\|\}~]/g, ''); // remove special characters
    }
    text = text.replace(/_/g, ' ');
    text = replaceLanguageCharacters(text);

    return text;
}

/* istanbul ignore next */
function createSchemaObject(typeValue, options) {
    options.type = typeValue;
    return options;
}

function isObject(obj) {
    return !!obj && obj.constructor === Object && Object.keys(obj).length > 0;
}

/* istanbul ignore next */
function addToSchema(name) {
    return {
        [`${name}_fuzzy`]: createSchemaObject([String], {
            default: [],
            index: false
        })
    };
}

/* istanbul ignore next */
function createFields(schema, fields) {
    var indexes = {};
    fields.forEach(item => {
        if (typeof item === 'string' || item instanceof String) {
            schema.add(addToSchema(item));
            indexes[`${item}_fuzzy`] = 'text';
        } else if (isObject(item)) {
            if (item.keys) {
                item.keys.forEach(key => {
                    schema.add(addToSchema(`${item.name}_fuzzy.${key}`));
                    indexes[`${item.name}_fuzzy.${key}_fuzzy`] = 'text';
                });
            } else {
                schema.add(addToSchema(item.name));
                indexes[`${item.name}_fuzzy`] = 'text';
            }
        } else {
            throw new TypeError('Fields items must be String or Object.');
        }
    });

    schema.index(indexes);
}

/* istanbul ignore next */
function createNGrams(attributes, fields) {
    fields.forEach(item => {
        if (typeof item === 'string' || item instanceof String) {
            attributes[`${item}_fuzzy`] = nGrams(replaceSymbols(attributes[item], true));
        } else if (isObject(item)) {
            var escapeSpecialCharacters = item.escapeSpecialCharacters !== false;

            if (item.keys) {
                item.keys.forEach(key => {
                    if (item.minSize) {
                        attributes[`${item.name}_fuzzy`][`${key}_fuzzy`] = nGrams(replaceSymbols(attributes[item.name][0][key], escapeSpecialCharacters), item.minSize)
                    } else {
                        attributes[`${item.name}_fuzzy`][`${key}_fuzzy`] = nGrams(replaceSymbols(attributes[item.name][0][key], escapeSpecialCharacters))
                    }
                });
            } else {
                if (item.minSize) {
                    attributes[`${item.name}_fuzzy`] = nGrams(replaceSymbols(attributes[item.name], escapeSpecialCharacters), item.minSize);
                } else {
                    attributes[`${item.name}_fuzzy`] = nGrams(replaceSymbols(attributes[item.name], escapeSpecialCharacters));
                }
            }
        }
    });
}

/* istanbul ignore next */
function removeFuzzyElements(fields) {
    return function (doc, ret, opt) {
        fields.forEach(item => {
            if (typeof item === 'string' || item instanceof String) {
                delete ret[`${item}_fuzzy`];
            } else if (isObject(item)) {
                delete ret[`${item.name}_fuzzy`];
            }
        });
        return ret;
    }
}

module.exports = function (schema, options) {
    if (!options || (options && !options.fields)) {
        throw new Error('You must set at least one field for fuzzy search.');
    }

    if (!Array.isArray(options.fields)) {
        throw new TypeError('Fields must be an array.');
    }

    options.fields.forEach(item => {
        if (isObject(item) && item.keys && (!Array.isArray(item.keys) && typeof item.keys !== 'string')) {
            throw new TypeError('Key must be an array or a string.');
        }
    });

    createFields(schema, options.fields);

    schema.set('toObject', {
        transform: removeFuzzyElements(options.fields)
    });

    schema.set('toJSON', {
        transform: removeFuzzyElements(options.fields)
    });

    schema.pre('save', function (next) {
        createNGrams(this, options.fields);
        next();
    });

    schema.statics['fuzzySearch'] = function () {
        var args = Object.values(arguments);

        if (args.length === 0 && (typeof args[0] !== 'string' || !isObject(args[0]))) {
            throw new TypeError('Fuzzy Search: First argument is mandatory and must be a string or an object.');
        }

        var queryString = isObject(args[0]) ? args[0].query : args[0];

        var query = nGrams(replaceSymbols(queryString));
        var options = null;
        var callback = null;

        if (args[1] && typeof args[1] === 'function') {
            callback = args[1];
        } else if (args[1] && isObject(args[1])) {
            options = args[1];
        }

        if (!callback && typeof args[2] === 'function') {
            callback = args[2];
        }

        var search;

        if (!options) {
            search = {$text: {$search: query}}
        } else {
            search = {
                $and: [
                    {$text: {$search: query}},
                    options
                ]
            }
        }

        return Model['find'].apply(this, [callback]).where(search);
    };
};