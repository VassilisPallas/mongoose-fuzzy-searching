var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var rewire = require('rewire');
var plugin = rewire('../index');

describe('nGrams', function () {
    var nGrams;

    beforeEach(function () {
        nGrams = plugin.__get__('nGrams');
    });

    afterEach(function () {
        plugin = rewire('../index');
    });

    context('with default minSize', function () {
        it('should return empty array without attribute', function () {
            expect(nGrams()).to.be.empty;
        });

        it('should be equal to ["a"] if the given text is `a`', function () {
            expect(nGrams('a')).to.deep.equal(["a"]);
        });

        it('should be equal to `["aa", "aaa"]` if the given text is `aaa`', function () {
            expect(nGrams('aaa')).to.deep.equal(["aa", "aaa"]);
        });

        it('should be equal to `["23", "12", "123"]` if the given text is 123 (as a number)', function () {
            expect(nGrams(123)).to.deep.equal(["23", "12", "123"]);
        });
    });

    context('with specific minSize', function () {
        it('should throw an Error because the minSize is negative', function () {
            expect(nGrams.bind(nGrams, 'aaa', -1)).to.throw();
        });

        it('should throw an Error because the minSize is 0', function () {
            expect(nGrams.bind(nGrams, 'aaa', 0)).to.throw();
        });

        it('should return `["aaa"]` because the minSize is 3', function () {
            expect(nGrams('aaa', 3)).to.deep.equal(["aaa"])
        });

        it('should return `["aaa","aaaa", "aaaaa"]` because the minSize is 3 and prefixOnly to true', function () {
            expect(nGrams('aaaaa', 3, true)).to.deep.equal(["aaa", "aaaa", "aaaaa"])
        });
    });
});

describe('makeNGrams', function () {
    var makeNGrams;

    beforeEach(function () {
        makeNGrams = plugin.__get__('makeNGrams');
    });

    afterEach(function () {
        plugin = rewire('../index');
    });

    context('with default minSize', function () {
        it('should return empty array without attribute', function () {
            expect(makeNGrams()).to.be.empty;
        });

        it('should return `["oe", "jo", "joe", "do", "doe"]` with attribute `Joe Doe`', function () {
            expect(makeNGrams('Joe Doe')).to.deep.equal(['oe', 'jo', 'joe', 'do', 'doe']);
        });
    });

    context('with specific `minSize`', function () {
        it('should return `["joe", "doe"]` because the minSize is 3', function () {
            expect(makeNGrams('Joe Doe', false, 3)).to.deep.equal(["joe", "doe"]);
        });
    });

    context('with `prefixOnly`', function () {
        it('should return `["joe", "doe"]` because the minSize is 3', function () {
            expect(makeNGrams('Joe Doe', false, 2, false)).to.deep.equal(['oe', 'jo', 'joe', 'do', 'doe']);
        });
    });
});

describe('replaceSymbols', function () {
    var replaceSymbols;

    beforeEach(function () {
        replaceSymbols = plugin.__get__('replaceSymbols');
    });

    afterEach(function () {
        plugin = rewire('../index');
    });

    it('should return `hello world` because the given string is `hello_world`', function () {
        expect(replaceSymbols('hello_world')).to.equal('hello world')
    });

    it('should return `exampledomaincom` because the given string is `example@domain.com`', function () {
        expect(replaceSymbols('example@domain.com', true)).to.equal('exampledomaincom')
    });

    it('should return `example@domain.com` because the given string is `example@domain.com`', function () {
        expect(replaceSymbols('example@domain.com')).to.equal('example@domain.com')
    });
});

describe('isObject', function () {
    var isObject;

    beforeEach(function () {
        isObject = plugin.__get__('isObject');
    });

    afterEach(function () {
        plugin = rewire('../index');
    });

    it('should return false because the parameter is array', function () {
        expect(isObject([])).to.be.false;
    });

    it('should return false because the parameter is undefined', function () {
        expect(isObject()).to.be.false;
    });

    it('should return false because object is empty', function () {
        expect(isObject({})).to.be.false;
    });

    it('should return true', function () {
        expect(isObject({ name: 'Joe' })).to.be.true;
    });
});

describe('isFunction', function () {
    var isFunction;

    beforeEach(function () {
        isFunction = plugin.__get__('isFunction');
    });

    afterEach(function () {
        plugin = rewire('../index');
    });

    it('should return false because the parameter is array', function () {
        expect(isFunction([])).to.be.false;
    });

    it('should return false because the parameter is undefined', function () {
        expect(isFunction()).to.be.false;
    });

    it('should return false because the parameter is null', function () {
        expect(isFunction(null)).to.be.false;
    });

    it('should return false because the parameter is object', function () {
        expect(isFunction({})).to.be.false;
    });

    it('should return true', function () {
        expect(isFunction(function () { })).to.be.true;
    });
});

describe('objectToValuesPolyfill', function () {
    var objectToValuesPolyfill;

    beforeEach(function () {
        objectToValuesPolyfill = plugin.__get__('objectToValuesPolyfill');
    });

    afterEach(function () {
        plugin = rewire('../index');
    });

    it('should return an empty array', function () {
        expect(objectToValuesPolyfill({})).to.have.lengthOf(0);
    });

    it('should return false because the parameter is undefined', function () {
        expect(objectToValuesPolyfill({ '0': 'test' })).to.have.lengthOf(1);
    });
});

describe('fuzzy search', function () {
    context('', function () {
        var schema = {
            add: function () {
            },
            index: function () {
            },
            set: function () {
            },
            pre: function () {
            },
            statics: []
        };

        it('should throw an Error because the options attribute is undefined', function () {
            expect(plugin.bind(this)).to.throw(Error)
        });

        it('should throw an Error because the fields option is undefined', function () {
            expect(plugin.bind(this, schema, {})).to.throw(Error)
        });

        it('should throw an Error because the fields option is not an array', function () {
            expect(plugin.bind(this, schema, { fields: '123' })).to.throw(TypeError)
        });

        it("should return TypeError because keys is not a String or an Array", function (done) {
            expect(plugin.bind(this, schema, {
                fields: [{
                    keys: function () {
                    }
                }]
            })).to.throw(TypeError);
            done();
        });
    });
});