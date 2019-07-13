var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var fuzzy_searching = require('../');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

before(function (done) {
    mongoose.Promise = global.Promise;
    mongoose.set('useCreateIndex', true);
    mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/fuzzy-test', {
        useNewUrlParser: true,
    });
    done();
});

after(function (done) {
    mongoose.disconnect(function () {
        done();
    });
});


describe('new versions of js (with Object.values)', function () {

    context('fuzzySearch', function () {
        describe('mongoose_fuzzy_searching without the right options', function () {
            var schema = new Schema({ name: String }, { collection: 'fuzzy_searching_test_1' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User1 = mongoose.model('User1', schema);

            before(function (done) {
                var user = new User1({ name: 'Joe' });

                user.save(function () {
                    done();
                });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_1", function () {
                    done();
                });
            });

            context('Error handling', function () {
                it("fuzzySearch() -> should return an TypeError because the first argument is undefined", function (done) {
                    expect(User1.fuzzySearch.bind(this)).to.throw(TypeError);
                    done();
                });

                it("fuzzySearch() -> should return an TypeError because the first argument is a function", function (done) {
                    expect(User1.fuzzySearch.bind(this, function (err, user) {
                    })).to.throw(TypeError);
                    done();
                });
            });
        });

        describe('mongoose_fuzzy_searching without options and callback', function () {
            var schema = new Schema({ name: String }, { collection: 'fuzzy_searching_test_2' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User2 = mongoose.model('User2', schema);

            before(function (done) {
                var user = new User2({ name: 'Joe' });

                user.save(function () {
                    done();
                });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_2", function () {
                    done();
                });
            });

            it("fuzzySearch() -> should return Promise", function (done) {
                var result = User2.fuzzySearch('jo');
                expect(result).to.have.property('then');
                done();
            });

            it("fuzzySearch() -> should find one user with string as first parameter", function (done) {
                User2.fuzzySearch('jo').then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err)
                });
            });

            it("fuzzySearch() -> should find one user with object as first parameter", function (done) {
                User2.fuzzySearch({ query: 'jo' }).then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });

            it("fuzzySearch() -> should find one user with object as first parameter (with `prefixOnly`)", function (done) {
                User2.fuzzySearch({ query: 'Joe', prefixOnly: true }).then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });
        });

        describe('mongoose_fuzzy_searching with options and without callback', function () {
            var schema = new Schema({ name: String, lastName: String }, { collection: 'fuzzy_searching_test_3' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User3 = mongoose.model('User3', schema);

            before(function (done) {
                var user = new User3({ name: 'Joe', lastName: 'Doe' });

                user.save(function () {
                    done();
                });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_3", function () {
                    done();
                });
            });

            it("fuzzySearch() -> should not be able to find users because the options searches for `lastName` with value `test`", function (done) {
                User3.fuzzySearch('jo', { lastName: 'test' }).then(function (result) {
                    expect(result).to.have.lengthOf(0);
                    done();
                }).catch(function (err) {
                    done(err)
                });
            });

            it("fuzzySearch() -> should be able to find users because the options searches for `lastName` with value `Doe`", function (done) {
                User3.fuzzySearch('jo', { lastName: 'Doe' }).then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err)
                });
            });
        });

        describe('mongoose_fuzzy_searching with callback and without options', function () {
            var schema = new Schema({ name: String }, { collection: 'fuzzy_searching_test_4' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User4 = mongoose.model('User4', schema);

            before(function (done) {
                var user = new User4({ name: 'Joe' });

                user.save(function () {
                    done();
                });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_4", function () {
                    done();
                });
            });

            it("fuzzySearch() -> should return the results with callback", function (done) {
                User4.fuzzySearch('jo', function (err, doc) {
                    expect(err).to.be.null;
                    expect(doc).to.have.lengthOf(1);
                    done(err);
                })
            });
        });

        describe('mongoose_fuzzy_searching with options and callback', function () {
            var schema = new Schema({ name: String, lastName: String }, { collection: 'fuzzy_searching_test_5' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User5 = mongoose.model('User5', schema);

            before(function (done) {
                var user = new User5({ name: 'Joe', lastName: 'Doe' });

                user.save(function () {
                    done();
                });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_5", function () {
                    done();
                });
            });

            it("fuzzySearch() -> should not be able to find users because the options searches for `lastName` with value `test` and return the result with callback", function (done) {
                User5.fuzzySearch('jo', { lastName: 'test' }, function (err, doc) {
                    expect(err).to.be.null;
                    expect(doc).to.have.lengthOf(0);
                    done(err);
                });
            });

            it("fuzzySearch() -> should not be able to find users because the options searches for `lastName` with value `Doe` and return the result with callback", function (done) {
                User5.fuzzySearch('jo', { lastName: 'Doe' }, function (err, doc) {
                    expect(err).to.be.null;
                    expect(doc).to.have.lengthOf(1);
                    done(err);
                });
            });
        });

        describe('mongoose_fuzzy_searching with `keys` key', function () {
            var schema = new Schema({
                texts: [{
                    title: String,
                    description: String,
                    language: String
                }]
            }, { collection: 'fuzzy_searching_test_6' });

            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: 'texts',
                        escapeSpecialCharacters: false,
                        keys: ["title", "language"]
                    }
                ]
            });

            var User6 = mongoose.model('User6', schema);

            before(function (done) {
                var user = new User6({
                    texts: [
                        {
                            title: 'this is a title',
                            description: 'descr!',
                            language: 'en'
                        },
                        {
                            title: 'awesome!',
                            description: 'descr!',
                            language: 'el'
                        }
                    ]
                });

                user.save(function (err) {
                    done();
                });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_6", function () {
                    done();
                });
            });

            it("fuzzySearch() -> should be able to find the title because the text is `this is`", function (done) {
                User6.fuzzySearch('this is').then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err)
                });
            });
        });

        describe('mongoose_fuzzy_searching update user with `findOneAndUpdate`', function () {
            var schema = new Schema({ name: String, age: Number }, { collection: 'fuzzy_searching_test_7' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User7 = mongoose.model('User7', schema);

            before(function (done) {
                var user = new User7({ name: 'Joe' });

                user.save(function () {
                    User7.findOneAndUpdate(user._id, { age: 30 }, function () {
                        done();
                    });
                });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_7", function () {
                    done();
                });
            });

            it("fuzzySearch() -> should return Promise", function (done) {
                var result = User7.fuzzySearch('jo');
                expect(result).to.have.property('then');
                done();
            });

            it("fuzzySearch() -> should find one user with string as first parameter", function (done) {
                User7.fuzzySearch('jo').then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err)
                });
            });

            it("fuzzySearch() -> should find one user with object as first parameter", function (done) {
                User7.fuzzySearch({ query: 'jo' }).then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });
        });

        describe('mongoose_fuzzy_searching update user with `update`', function () {
            var schema = new Schema({ name: String }, { collection: 'fuzzy_searching_test_8' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User8 = mongoose.model('User8', schema);

            before(function (done) {
                var user = new User8({ name: 'Joe' });

                user.save(function () {
                    User8.update({ _id: user._id }, { name: 'Someone' }, function () {
                        done();
                    });
                });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_8", function () {
                    done();
                });
            });

            it("fuzzySearch() -> should return Promise", function (done) {
                var result = User8.fuzzySearch('some');
                expect(result).to.have.property('then');
                done();
            });

            it("fuzzySearch() -> should find one user with string as first parameter", function (done) {
                User8.fuzzySearch('some').then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err)
                });
            });

            it("fuzzySearch() -> should find one user with object as first parameter", function (done) {
                User8.fuzzySearch({ query: 'some' }).then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });
        });

        describe('mongoose_fuzzy_searching insert users with `insertMany`', function () {
            var schema = new Schema({ name: String }, { collection: 'fuzzy_searching_test_11' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User11 = mongoose.model('User11', schema);


            before(function (done) {
                User11.insertMany([{ name: 'Vassilis' }, { name: 'Dimitris' }])
                    .then(function (result) {
                        done();
                    })
                    .catch(function (err) {
                        done(err)
                    });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_11", function () {
                    done();
                });
            });


            it("fuzzySearch() -> should return Promise", function (done) {
                var result = User11.fuzzySearch('vassi');
                expect(result).to.have.property('then');
                done();
            });

            it("fuzzySearch() -> should find one user with string as first parameter", function (done) {
                User11.fuzzySearch('vassi').then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err)
                });
            });
        });

        describe('mongoose_fuzzy_searching update users with `updateMany`', function () {
            var schema = new Schema({ name: String }, { collection: 'fuzzy_searching_test_12' });
            schema.plugin(fuzzy_searching, {
                fields: [
                    {
                        name: "name",
                        minSize: 2
                    }
                ]
            });

            var User12 = mongoose.model('User12', schema);


            before(function (done) {
                User12.insertMany([{ name: 'Vassilis' }, { name: 'Dimitris' }])
                    .then(function (result) {
                        return User12.updateMany({ name: 'Vassilis' }, { name: 'Pallas' })
                    })
                    .then(function () {
                        done();
                    })
                    .catch(function (err) {
                        done(err)
                    });
            });

            after(function (done) {
                mongoose.connection.dropCollection("fuzzy_searching_test_12", function () {
                    done();
                });
            });


            it("fuzzySearch() -> should return Promise", function (done) {
                var result = User12.fuzzySearch('pall');
                expect(result).to.have.property('then');
                done();
            });

            it("fuzzySearch() -> should find one user with string as first parameter", function (done) {
                User12.fuzzySearch('pall').then(function (result) {
                    expect(result).to.have.lengthOf(1);
                    done();
                }).catch(function (err) {
                    done(err)
                });
            });
        });
    });
});


describe('old versions of js (without Object.values', function () {

    describe('mongoose_fuzzy_searching with options and without callback', function () {
        var schema = new Schema({ name: String, lastName: String }, { collection: 'fuzzy_searching_test_9' });
        schema.plugin(fuzzy_searching, {
            fields: [
                {
                    name: "name",
                    minSize: 2
                }
            ]
        });

        var User9 = mongoose.model('User9', schema);

        before(function (done) {
            Object.values = null;
            var user = new User9({ name: 'Joe', lastName: 'Doe' });

            user.save(function () {
                done();
            });
        });

        after(function (done) {
            mongoose.connection.dropCollection("fuzzy_searching_test_9", function () {
                done();
            });
        });

        it("fuzzySearch() -> should not be able to find users because the options searches for `lastName` with value `test`", function (done) {
            User9.fuzzySearch('jo', { lastName: 'test' }).then(function (result) {
                expect(result).to.have.lengthOf(0);
                done();
            }).catch(function (err) {
                done(err)
            });
        });

        it("fuzzySearch() -> should be able to find users because the options searches for `lastName` with value `Doe`", function (done) {
            User9.fuzzySearch('jo', { lastName: 'Doe' }).then(function (result) {
                expect(result).to.have.lengthOf(1);
                done();
            }).catch(function (err) {
                done(err)
            });
        });
    });

    describe('mongoose_fuzzy_searching with options and callback', function () {
        var schema = new Schema({ name: String, lastName: String }, { collection: 'fuzzy_searching_test_10' });
        schema.plugin(fuzzy_searching, {
            fields: [
                {
                    name: "name",
                    minSize: 2
                }
            ]
        });

        var User10 = mongoose.model('User10', schema);

        before(function (done) {
            Object.values = null;
            var user = new User10({ name: 'Joe', lastName: 'Doe' });

            user.save(function () {
                done();
            });
        });

        after(function (done) {
            mongoose.connection.dropCollection("fuzzy_searching_test_10", function () {
                done();
            });
        });

        it("fuzzySearch() -> should not be able to find users because the options searches for `lastName` with value `test` and return the result with callback", function (done) {
            User10.fuzzySearch('jo', { lastName: 'test' }, function (err, doc) {
                expect(err).to.be.null;
                expect(doc).to.have.lengthOf(0);
                done(err);
            });
        });

        it("fuzzySearch() -> should not be able to find users because the options searches for `lastName` with value `Doe` and return the result with callback", function (done) {
            User10.fuzzySearch('jo', { lastName: 'Doe' }, function (err, doc) {
                expect(err).to.be.null;
                expect(doc).to.have.lengthOf(1);
                done(err);
            });
        });
    });
});




