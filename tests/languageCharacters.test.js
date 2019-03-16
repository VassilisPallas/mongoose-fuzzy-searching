var chai = require('chai');
var expect = chai.expect;

var languageCharacters = require('../languageCharacters');

describe('languageCharacters', function () {
    it('should return empty string because the attribute is undefined', function () {
        expect(languageCharacters()).to.equal('');
    });

    it('should return empty string because the attribute is empty string', function () {
        expect(languageCharacters('')).to.equal('');
    });

    it('should return `asteris` because the given string is `αστέρης`', function () {
        expect(languageCharacters('αστέρης')).to.equal('asteris');
    });

    it('should return `asteris` because the given string is `αστέρης`', function () {
        expect(languageCharacters('Αστέρης')).to.equal('asteris');
    });

    it('should return `evcharisto` because the given string is `ευχαριστώ`', function () {
        expect(languageCharacters('ευχαριστώ')).to.equal('evcharisto');
    });

    it('should return `alesund` because the given string is `Ålesund`', function () {
        expect(languageCharacters('Atlético Madrid')).to.equal('atletico madrid');
    });

    it('should return `hello` because the given string is `hello`', function () {
        expect(languageCharacters('hello')).to.equal('hello');
    });
});