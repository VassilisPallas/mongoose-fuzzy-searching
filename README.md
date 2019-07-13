Mongoose Fuzzy Searching
=========

mongoose-fuzzy-searching is simple and lightweight plugin that enables fuzzy searching in documents in MongoDB.
This code is based on [this article](https://medium.com/xeneta/fuzzy-search-with-mongodb-and-python-57103928ee5d).

[![Build Status](https://travis-ci.com/VassilisPallas/mongoose-fuzzy-searching.svg?token=iwmbqGL1Zp9rkA7hmQ6P&branch=master)](https://travis-ci.com/VassilisPallas/mongoose-fuzzy-searching)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FVassilisPallas%2Fmongoose-fuzzy-searching.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FVassilisPallas%2Fmongoose-fuzzy-searching?ref=badge_shield)

## Features
  - Creates Ngrams for the selected keys in the collection
  - [Add __fuzzySearch__ method on model](#simple-usage)
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
var mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    age: Number
});

UserSchema.plugin(mongoose_fuzzy_searching, {fields: ['firstName', 'lastName']});

var User = mongoose.model('User', UserSchema);

var user = new User({ firstName: 'Joe',  lastName: 'Doe', email: 'joe.doe@mail.com', age: 30});

user.save(function () {
    // mongodb: { ..., firstName_fuzzy: [String], lastName_fuzzy: [String] }

    User.fuzzySearch('jo', function (err, users) {
        console.error(err);
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
    });
});
```

The results are sorted by the `confidenceScore` key. You can override this option.

```javascript
User.fuzzySearch('jo').sort({ age: -1 }).exec(function (err, users) {
    console.error(err);
    console.log(users);
});
```

### Plugin Options

Options must have a `fields` key, which is an Array of `Strings` or an Array of `Objects`.

```javascript
var mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String
});

UserSchema.plugin(mongoose_fuzzy_searching, {fields: ['firstName', 'lastName']});
// or
UserSchema.plugin(mongoose_fuzzy_searching, {
    fields: [{
        name: 'firstName'
    }, {
        name: 'lastName'
    }]
});
```
#### Object keys

The below table contains the expected keys for an object

| __key__| __type__ | __default__ | __description__ |
|----------------------------|-------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| name | __String__ | null |Collection key name |
| minSize | __Integer__ | 2 |N-grams min size. [Learn more about N-grams](http://text-analytics101.rxnlp.com/2014/11/what-are-n-grams.html) |
| weight | __Integer__ | 1 | Denotes the significance of the field relative to the other indexed fields in terms of the text search score. [Learn more about index weights](https://docs.mongodb.com/manual/tutorial/control-results-of-text-search/) |
| prefixOnly | __Boolean__ | false | Only return ngrams from start of word. (It gives more precise results) | 
| escapeSpecialCharacters | __Boolean__ | true | Remove special characters from N-grams.|
| keys | __Array[String]__ | null | If the type of the collection attribute is `Object`, you can define which attributes will be used for fuzzy searching |

Example:

```javascript
var mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    text: [{
        title: String,
        description: String,
        language: String
    }]
});

UserSchema.plugin(mongoose_fuzzy_searching, {
    fields: [{
        name: 'firstName',
        minSize: 2,
        weight: 5
    }, {
        name: 'lastName',
        minSize: 3,
        prefixOnly: true,
    }, {
        name: 'email',
        escapeSpecialCharacters: false,
    }, {
        name: 'text',
        keys: ["title"] // supports only one key so far.
    }]
    
});
```
### fuzzySearch parameters

`fuzzySearch` method can accept up to three parameters. The first one is the query, which can either be either a `String` or an `Object`. This parameter is __required__.
The second parameter can either be eiter an `Object` with other queries, for example `age: { $gt: 18 }`, or a callback function.
If the second parameter is the options, then the third parameter is the callback function. If you don't set a callback function, the results will be returned inside a Promise.

The below table contains the expected keys for the first parameter (if is an object)

| __key__ | __type__ | __deafult__ | __description__ |
|----------------------------|-------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| query | __String__ | null | String to search |
| minSize | __Integer__ | 2 | N-grams min size. |
| prefixOnly | __Boolean__ | false | Only return ngrams from start of word. (It gives more precise results) the prefix |

Example:


```javascript

/* Without options and callback */
Model.fuzzySearch('jo').then(console.log).catch(console.error);
// or
Model.fuzzySearch({query: 'jo'}).then(console.log).catch(console.error);
// with prefixOnly and minSize
Model.fuzzySearch({query: 'jo', prefixOnly: true, minSize: 4}).then(console.log).catch(console.error);

/* With options and without callback */
Model.fuzzySearch('jo', {age: { $gt: 18 }}).then(console.log).catch(console.error);

/* With callback */
Model.fuzzySearch('jo', function(err, doc) {
  if(err) {
      console.error(err);
  } else {
      console.log(doc);
  }
});

/* With options and callback */
Model.fuzzySearch('jo', {age: { $gt: 18 }}, function(err, doc) {
  if(err) {
      console.error(err);
  } else {
      console.log(doc);
  }
});
```

## Work with pre-existing data

The plugin creates indexes for the selected fields. In the below example the new indexes will be `firstName_fuzzy` and `lastName_fuzzy`. Also, each document will have the fields `firstName_fuzzy`[String] and `lastName_fuzzy`[String]. These arrays will contain the anagrams for the selected fields.

```javascript
var mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    age: Number
});

UserSchema.plugin(mongoose_fuzzy_searching, {fields: ['firstName', 'lastName']});
```

In other words, thit plugin creates anagrams when you create or update a document. All the pre-existing documents won't contain these fuzzy arrays, so `fuzzySearch` function, will not be able to find them.

### Update all pre-existing documents with ngrams

In order to create anagrams for pre-existing documents, you should update each document. The below example, updates the `firstName` attribute to every document on the collection `User`.

```javascript
const { each, queue } = require('async');

const updateFuzzy = async (Model, attrs) => {
   const docs = await Model.find();

   const updateToDatabase = async (data, callback) => {
      try {
         if(attrs && attrs.length) {
            const obj = attrs.reduce((acc, attr) => ({ ...acc, [attr]: data[attr] }), {});
            return Model.findByIdAndUpdate(data._id, obj).exec();
         }

         return Model.findByIdAndUpdate(data._id, data).exec();
      } catch (e) {
         console.log(e);
      } finally {
         callback();
      }
   };

   const myQueue = queue(updateToDatabase, 10);
   each(docs, (data) => myQueue.push(data.toObject()));

   myQueue.empty = function () {};
   myQueue.drain = function () {};
}

// usage
updateFuzzy(User, ['firstName']);
```

### Delete old ngrams from all documents

In the previous example, we set `firstName` and `lastName` as the fuzzy attributes. If you remove the `firstName` from the fuzzy fields, the `firstName_fuzzy` array will not be removed by the collection. If you want to remove the array on each document you have to unset that value.

```javascript
const { each, queue } = require('async');

const removeUnsedFuzzyElements = (Model, attrs) => {
    const docs = await Model.find();

    const updateToDatabase = async (data, callback) => {
        try {
            const $unset = attrs.reduce((acc, attr) => ({...acc, [`${attr}_fuzzy`]: 1}), {})
            return Model.findByIdAndUpdate(data._id, { $unset }, { new: true, strict: false }).exec();
        } catch (e) {
            console.log(e);
        } finally {
            callback();
        }
    };

    const myQueue = queue(updateToDatabase, 10);

    each(docs, (data) => myQueue.push(data.toObject()), () => { });

    myQueue.empty = function () {
    };

    myQueue.drain = function () {
        console.log("done");
    };
}

// usage
removeUnsedFuzzyElements(User, ['firstName']);
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