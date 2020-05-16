# Mongoose Fuzzy Searching

mongoose-fuzzy-searching is simple and lightweight plugin that enables fuzzy searching in documents in MongoDB.
This code is based on [this article](https://medium.com/xeneta/fuzzy-search-with-mongodb-and-python-57103928ee5d).

[![Build Status](https://travis-ci.com/VassilisPallas/mongoose-fuzzy-searching.svg?token=iwmbqGL1Zp9rkA7hmQ6P&branch=master)](https://travis-ci.com/VassilisPallas/mongoose-fuzzy-searching)
[![codecov](https://codecov.io/gh/VassilisPallas/mongoose-fuzzy-searching/branch/master/graph/badge.svg)](https://codecov.io/gh/VassilisPallas/mongoose-fuzzy-searching)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FVassilisPallas%2Fmongoose-fuzzy-searching.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FVassilisPallas%2Fmongoose-fuzzy-searching?ref=badge_shield)

## Features

- Creates Ngrams for the selected keys in the collection
- [Add **fuzzySearch** method on model](#simple-usage)
- [Work with pre-existing data](#work-with-pre-existing-data)

## Installation

Install using [npm](https://npmjs.org)

```
npm i mongoose-fuzzy-searching
```

## Usage

### Simple usage

In the below example, we have a `User` collection and we want to make fuzzy searching in `firstName` and `lastName`.

```javascript
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  age: Number,
});

UserSchema.plugin(mongoose_fuzzy_searching, { fields: ['firstName', 'lastName'] });

const User = mongoose.model('User', UserSchema);

const user = new User({ firstName: 'Joe', lastName: 'Doe', email: 'joe.doe@mail.com', age: 30 });

try {
  await user.save(); // mongodb: { ..., firstName_fuzzy: [String], lastName_fuzzy: [String] }
  const users = await User.fuzzySearch('jo');

  console.log(users);
  // each user object will not contain the fuzzy keys:
  // Eg.
  // {
  //   "firstName": "Joe",
  //   "lastName": "Doe",
  //   "email": "joe.doe@mail.com",
  //   "age": 30,
  //   "confidenceScore": 34.3 ($text meta score)
  // }
} catch (e) {
  console.error(e);
}
```

The results are sorted by the `confidenceScore` key. You can override this option.

```javascript
try {
  const users = await User.fuzzySearch('jo').sort({ age: -1 }).exec();
  console.log(users);
} catch (e) {
  console.error(e);
}
```

### Plugin Options

Options can contain two attributes, `fields` and `middlewares`.

#### Fields

Fields attribute is mandatory and should be either an array of `Strings` or an array of `Objects`.

```javascript
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
});

UserSchema.plugin(mongoose_fuzzy_searching, { fields: ['firstName', 'lastName'] });
// or
UserSchema.plugin(mongoose_fuzzy_searching, {
  fields: [
    {
      name: 'firstName',
    },
    {
      name: 'lastName',
    },
  ],
});
```

##### Object keys

The below table contains the expected keys for an object

| **key**                 | **type**          | **default** | **description**                                                                                                                                                                                                          |
| ----------------------- | ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name                    | **String**        | null        | Collection key name                                                                                                                                                                                                      |
| minSize                 | **Integer**       | 2           | N-grams min size. [Learn more about N-grams](http://text-analytics101.rxnlp.com/2014/11/what-are-n-grams.html)                                                                                                           |
| weight                  | **Integer**       | 1           | Denotes the significance of the field relative to the other indexed fields in terms of the text search score. [Learn more about index weights](https://docs.mongodb.com/manual/tutorial/control-results-of-text-search/) |
| prefixOnly              | **Boolean**       | false       | Only return ngrams from start of word. (It gives more precise results)                                                                                                                                                   |
| escapeSpecialCharacters | **Boolean**       | true        | Remove special characters from N-grams.                                                                                                                                                                                  |
| keys                    | **Array[String]** | null        | If the type of the collection attribute is `Object` or `[Object]` (see example), you can define which attributes will be used for fuzzy searching                                                                        |

|

Example:

```javascript
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  content: {
      en: String,
      de: String,
      it: String
  }
  text: [
    {
      title: String,
      description: String,
      language: String,
    },
  ],
});

UserSchema.plugin(mongoose_fuzzy_searching, {
  fields: [
    {
      name: 'firstName',
      minSize: 2,
      weight: 5,
    },
    {
      name: 'lastName',
      minSize: 3,
      prefixOnly: true,
    },
    {
      name: 'email',
      escapeSpecialCharacters: false,
    },
    {
      name: 'content',
      keys: ['en', 'de', 'it'],
    },
    {
      name: 'text',
      keys: ['title', 'language'],
    },
  ],
});
```

#### Middlewares

Middlewares is an optional `Object` that can contain custom `pre` middlewares. This plugin is using some middlewares in order to create or update the fuzzy elements. That means that if you add `pre` middlewares, they will never get called since the plugin overrides them. To avoid that problem you can pass your custom midlewares into the plugin. Your middlewares will be called **first**. The middlewares you can pass are:

- preSave
  - stands for schema.pre("save", ...)
- preInsertMany
  - stands for schema.pre("insertMany", ...)
- preUpdate
  - stands for schema.pre("update", ...)
- preUpdateOne
  - stands for schema.pre("updateOne", ...)
- preFindOneAndUpdate
  - stands for schema.pre("findOneAndUpdate", ...)
- preUpdateMany
  - stands for schema.pre("updateMany", ...)

If you want to add any other middleware othen than the above ones, you can add it directly on the schema.

```javascript
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
});

UserSchema.plugin(mongoose_fuzzy_searching, {
  fields: ['firstName'],
  middlewares: {
    preSave: function() {
      // login here
    },
    preUpdateOne: async function {
      // can also pass promises
    }
  }
});
```

### fuzzySearch parameters

`fuzzySearch` method can accept up to three parameters. The first one is the query, which can either be either a `String` or an `Object`. This parameter is **required**.
The second parameter can either be eiter an `Object` with other queries, for example `age: { $gt: 18 }`, or a callback function.
If the second parameter is the options, then the third parameter is the callback function. If you don't set a callback function, the results will be returned inside a Promise.

The below table contains the expected keys for the first parameter (if is an object)

| **key**    | **type**    | **deafult** | **description**                                                                   |
| ---------- | ----------- | ----------- | --------------------------------------------------------------------------------- |
| query      | **String**  | null        | String to search                                                                  |
| minSize    | **Integer** | 2           | N-grams min size.                                                                 |
| prefixOnly | **Boolean** | false       | Only return ngrams from start of word. (It gives more precise results) the prefix |
| exact      | **Boolean** | false       | Matches on a phrase, as opposed to individual terms                               |

|

Example:

```javascript
/* Without options and callback */
Model.fuzzySearch('jo').then(console.log).catch(console.error);
// or
Model.fuzzySearch({ query: 'jo' }).then(console.log).catch(console.error);
// with prefixOnly and minSize
Model.fuzzySearch({ query: 'jo', prefixOnly: true, minSize: 4 })
  .then(console.log)
  .catch(console.error);

/* With options and without callback */
Model.fuzzySearch('jo', { age: { $gt: 18 } })
  .then(console.log)
  .catch(console.error);

/* With callback */
Model.fuzzySearch('jo', (err, doc) => {
  if (err) {
    console.error(err);
  } else {
    console.log(doc);
  }
});

/* With options and callback */
Model.fuzzySearch('jo', { age: { $gt: 18 } }, (err, doc) => {
  if (err) {
    console.error(err);
  } else {
    console.log(doc);
  }
});
```

## Work with pre-existing data

The plugin creates indexes for the selected fields. In the below example the new indexes will be `firstName_fuzzy` and `lastName_fuzzy`. Also, each document will have the fields `firstName_fuzzy`[String] and `lastName_fuzzy`[String]. These arrays will contain the anagrams for the selected fields.

```javascript
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  age: Number,
});

UserSchema.plugin(mongoose_fuzzy_searching, { fields: ['firstName', 'lastName'] });
```

In other words, thit plugin creates anagrams when you create or update a document. All the pre-existing documents won't contain these fuzzy arrays, so `fuzzySearch` function, will not be able to find them.

### Update all pre-existing documents with ngrams

In order to create anagrams for pre-existing documents, you should update each document. The below example, updates the `firstName` attribute to every document on the collection `User`.

```javascript
const updateFuzzy = async (Model, attrs) => {
  for await (const doc of Model.find()) {
    const obj = attrs.reduce((acc, attr) => ({ ...acc, [attr]: doc[attr] }), {});
    await Model.findByIdAndUpdate(doc._id, obj);
  }
};

// usage
await updateFuzzy(User, ['firstName']);
```

### Delete old ngrams from all documents

In the previous example, we set `firstName` and `lastName` as the fuzzy attributes. If you remove the `firstName` from the fuzzy fields, the `firstName_fuzzy` array will not be removed by the collection. If you want to remove the array on each document you have to unset that value.

```javascript
const removeUnsedFuzzyElements = (Model, attrs) => {
    for await (const doc of Model.find()) {
      const $unset = attrs.reduce((acc, attr) => ({...acc, [`${attr}_fuzzy`]: 1}), {})
      await Model.findByIdAndUpdate(data._id, { $unset }, { new: true, strict: false });
  }
}

// usage
await removeUnsedFuzzyElements(User, ['firstName']);
```

### Testing and code coverage

#### All tests

We use Jest for all of our unit and integration tests.

```bash
$ npm test
```

_Note: this will run all suites **serially** to avoid mutliple concurrent connection on the db._

This will run the tests using a memory database. If you wish for any reason to run the tests using an actual connection on a mongo instance, add the environment variable `MONGO_DB`:

```bash
$ MONGO_DB=true npm test
```

### Available test suites

#### unit tests

```bash
$ npm run test:unit
```

#### Integration tests

```bash
$ npm run test:integration
```

## License

MIT License

Copyright (c) 2019 Vassilis Pallas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FVassilisPallas%2Fmongoose-fuzzy-searching.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FVassilisPallas%2Fmongoose-fuzzy-searching?ref=badge_large)
