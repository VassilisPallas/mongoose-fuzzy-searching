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
    mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/fest-dev', {
        useNewUrlParser: true,
    });
    done();
});

after(function (done) {
    mongoose.disconnect(function () {
        done();
    });
});

describe('TEST', function () {
    var schema = new Schema({
        name: {
            type: String,
            trim: true,
            required: true,
        },
        type: {
            type: String,
            select: false,
        }
    },
        { collection: 'musicians' });

    schema.plugin(fuzzy_searching, {
        fields: [
            {
                name: "name",
                minSize: 3,
                weight: 100
            }
        ]
    });

    var User10 = mongoose.model('Musician', schema);

    it("TEST INSIDE", function (done) {
        const eventOptions = {
            $and: [
                { deleted: { $ne: true } },
            ]
        };

        User10.fuzzySearch('nikos', eventOptions, function (err, doc) {
            console.log(doc)
            expect(err).to.be.null;
            expect(doc).to.have.lengthOf(7);
            done(err);
        });
    });
});