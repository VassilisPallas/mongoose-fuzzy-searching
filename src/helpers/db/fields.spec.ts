import { Schema } from 'mongoose';

import { createFields, createNGrams, removeFuzzyElements } from './fields';
import { Attributes, Fields } from '../../types';

jest.mock('../ngrams');

describe('createFields', () => {
  let schema: Schema;

  beforeEach(() => {
    schema = new Schema();
  });

  it('should create the fields', () => {
    const fields: Fields = [
      'firstName',
      { keys: ['en', 'it'], name: 'description' },
      { name: 'lastName', weight: 10 },
    ];

    const { indexes, weights } = createFields(schema, fields);

    expect(indexes).toStrictEqual({
      firstName_fuzzy: 'text',
      'description_fuzzy.en_fuzzy': 'text',
      'description_fuzzy.it_fuzzy': 'text',
      lastName_fuzzy: 'text',
    });

    expect(weights).toStrictEqual({ lastName_fuzzy: 10 });
  });
});

describe('removeFuzzyElements', () => {
  it('should remove fuzzy fields', () => {
    const ret = {
      firstName: 'Joe',
      lastName: 'Doe',
      description: {
        en: 'Descr in English',
        it: 'Descr in Italian',
      },
      description_fuzzy: [{ en_fuzzy: ['Descr in English'], it_fuzzy: ['Descr in Italian'] }],
      firstName_fuzzy: ['Joe'],
      lastName_fuzzy: ['Doe'],
    };

    const fields: Fields = [
      'firstName',
      { name: 'lastName' },
      { name: 'description', keys: ['en', 'it'] },
    ];

    expect(removeFuzzyElements(fields)({}, ret)).toStrictEqual({
      firstName: 'Joe',
      lastName: 'Doe',
      description: {
        en: 'Descr in English',
        it: 'Descr in Italian',
      },
    });
  });
});

describe('createNGrams', () => {
  it('should store ngrams to fuzzy attributes', () => {
    const attributes: Attributes = {
      fistName: 'Joe',
      lastName: 'Doe',
      email: 'example@domain.tld',
      city: 'London',

      username: 'joe_doe',
      description: {
        en: 'Descr in English',
        it: 'Descr in Italian',
      },
      text: [
        {
          title: 'My title',
          description: 'My descr',
          language: 'en',
        },
      ],
      interests: ['football', 'hiking'],
    };

    const fields: Fields = [
      'fistName',

      { name: 'lastName', weight: 10 },
      { name: 'email', escapeSpecialCharacters: false },
      { name: 'city', minSize: 3 },
      { name: 'city', prefixOnly: true },
      { name: 'description', keys: ['en', 'it'] },
      { name: 'text', keys: ['title', 'description'] },
      { name: 'interests', minSize: 5 },
    ];

    createNGrams(attributes, fields);
    expect(attributes).toStrictEqual({
      fistName: 'Joe',
      lastName: 'Doe',
      email: 'example@domain.tld',
      city: 'London',
      username: 'joe_doe',

      description: {
        en: 'Descr in English',
        it: 'Descr in Italian',
      },
      text: [
        {
          title: 'My title',
          description: 'My descr',
          language: 'en',
        },
      ],
      interests: ['football', 'hiking'],
      fistName_fuzzy: ['Joe'],
      lastName_fuzzy: ['Doe'],
      email_fuzzy: ['example@domain.tld'],
      city_fuzzy: ['London'],

      description_fuzzy: [{ en_fuzzy: ['Descr in English'], it_fuzzy: ['Descr in Italian'] }],
      text_fuzzy: [{ title_fuzzy: ['My title'], description_fuzzy: ['My descr'] }],
      interests_fuzzy: ['football hiking'],
    });
  });

  it('should update empty attributes as empty array', () => {
    const attributes: Attributes = {
      lastName: 'Doe',
      email: 'example@domain.tld',
      city: '',
      state: '',
      username: 'joe_doe',
      description: {
        en: '',
        it: 'Descr in Italian',
      },
      text: [
        {
          title: 'My title',
          description: '',
          shortDescr: null,
          language: 'en',
        },
      ],
      interests: ['football', 'hiking'],
      stuff: null,
    };

    const fields: Fields = [
      'fistName',
      'state',
      { name: 'lastName', weight: 10 },
      { name: 'test' },
      { name: 'email', escapeSpecialCharacters: false },
      { name: 'city', minSize: 3 },
      { name: 'city', prefixOnly: true },
      { name: 'description', keys: ['en', 'it'] },
      { name: 'text', keys: ['title', 'description', 'shortDescr', 'notInialized'] },
      { name: 'WrongVal', keys: ['one', 'two'] },
      { name: 'stuff', keys: ['some'] },
      { name: 'interests', minSize: 5 },
    ];

    createNGrams(attributes, fields);
    expect(attributes).toStrictEqual({
      lastName: 'Doe',
      email: 'example@domain.tld',
      city: '',
      state: '',
      username: 'joe_doe',
      description: {
        en: '',
        it: 'Descr in Italian',
      },
      text: [
        {
          title: 'My title',
          description: '',
          shortDescr: null,
          language: 'en',
        },
      ],
      interests: ['football', 'hiking'],
      stuff: null,
      lastName_fuzzy: ['Doe'],
      email_fuzzy: ['example@domain.tld'],
      city_fuzzy: [],
      state_fuzzy: [],
      description_fuzzy: [{ en_fuzzy: [], it_fuzzy: ['Descr in Italian'] }],
      text_fuzzy: [{ title_fuzzy: ['My title'], description_fuzzy: [], shortDescr_fuzzy: [] }],
      interests_fuzzy: ['football hiking'],
      stuff_fuzzy: [],
    });
  });
});
