Mongoose Fuzzy Searching
=========

mongoose-fuzzy-searching is simple and lightweight plugin that enables fuzzy searching in documents in MongoDB.
The code is based on [this article](https://medium.com/xeneta/fuzzy-search-with-mongodb-and-python-57103928ee5d).

[![Build Status](https://travis-ci.com/VassilisPallas/mongoose-fuzzy-searching.svg?token=iwmbqGL1Zp9rkA7hmQ6P&branch=master)](https://travis-ci.com/VassilisPallas/mongoose-fuzzy-searching)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FVassilisPallas%2Fmongoose-fuzzy-searching.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FVassilisPallas%2Fmongoose-fuzzy-searching?ref=badge_shield)

## Features
  - Creates Ngrams for the selected keys in the collection
  - [Add __fuzzySearch__ method on model](#simple-usage)

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
    email: String
});

UserSchema.plugin(mongoose_fuzzy_searching, {fields: ['firstName', 'lastName']});

var User = mongoose.model('User', UserSchema);

var user = new User({ firstName: 'Joe',  lastName: 'Doe', email: 'joe.doe@mail.com'});

user.save(function () {
    // mongodb: { ..., firstName_fuzzy: [String], lastName_fuzzy: [String] }

    User.fuzzySearch('jo', function (err, users) {
        console.error(err);
        console.log(users); // each user object will not contain the fuzzy keys
    });
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

| __key__                    | __type__          | __description__                                                                                                                         |
|----------------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| name                       | __String__        | Collection key name                                                                                                                     |
| minSize                    | __Integer__       | N-grams min size. Default min size is `2`. [Learn more about N-grams](http://text-analytics101.rxnlp.com/2014/11/what-are-n-grams.html) |
| escapeSpecialCharacters    | __Boolean__       | Remove special characters from N-grams. Default value is `true`                                                                         |
| keys                       | __Array[String]__ | If the type of the collection attribute is `Object`, you can define which attributes will be used for fuzzy searching                   |

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
        minSize: 2
    }, {
        name: 'lastName',
        minSize: 3
    }, {
        name: 'email',
        escapeSpecialCharacters: false
    }, {
        name: 'text',
        keys: ["title", "description"]
    }]
    
});
```
### fuzzySearch parameters

`fuzzySearch` method can accept up to three parameters. The first one is the query, which can either be a `String` or an `Object`. This parameter is __required__.
The second parameter can either be an `Object` with other queries, for example `age: { $gt: 18 }`, or a callback function.
If the second parameter is the options, then the third parameter is the callback function. If you don't set a callback function, the results will be returned inside a Promise.

```javascript

/* Without options and callback */
Model.fuzzySearch('jo').then(console.log).catch(console.error);
// or
Model.fuzzySearch({query: 'jo'}).then(console.log).catch(console.error);

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
