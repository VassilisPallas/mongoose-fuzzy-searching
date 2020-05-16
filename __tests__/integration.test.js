/**
 * @group integration
 */

const fuzzySearching = require('..');
const db = require('./support/db');

beforeAll(async () => {
  await db.openConnection();
});

afterAll(async () => {
  await db.closeConnection();
});

describe('fuzzySearch', () => {
  describe('mongoose_fuzzy_searching without the right options', () => {
    const Model = db.createSchema({ name: String })(fuzzySearching, [
      {
        name: 'name',
        minSize: 2,
      },
    ]);

    beforeAll(async () => {
      await db.seed(Model, { name: 'Joe' });
    });

    describe('Error handling', () => {
      it('fuzzySearch() -> should return an TypeError when the first argument is undefined', () => {
        expect(Model.fuzzySearch.bind(this)).toThrow(
          'Fuzzy Search: First argument is mandatory and must be a string or an object.',
        );
      });

      it('fuzzySearch() -> should return an TypeError when the first argument is a function', () => {
        expect(Model.fuzzySearch.bind(this, () => {})).toThrow(
          'Fuzzy Search: First argument is mandatory and must be a string or an object.',
        );
      });
    });
  });

  describe('mongoose_fuzzy_searching without options and callback', () => {
    const Model = db.createSchema({ name: String })(fuzzySearching, [
      {
        name: 'name',
        minSize: 2,
      },
    ]);

    beforeAll(async () => {
      await db.seed(Model, { name: 'Joe' });
    });

    it('fuzzySearch() -> should return Promise', () => {
      const result = Model.fuzzySearch('jo');
      expect(result).toHaveProperty('then');
    });

    it('fuzzySearch() -> should find one user with empty string as first parameter', async () => {
      const result = await Model.fuzzySearch('');
      expect(result).toHaveLength(1);
    });

    it('fuzzySearch() -> should find one user with string as first parameter', async () => {
      const result = await Model.fuzzySearch('jo');
      expect(result).toHaveLength(1);
    });

    it('fuzzySearch() -> should find one user with object with empty query as first parameter', async () => {
      const result = await Model.fuzzySearch({ query: '' });
      expect(result).toHaveLength(1);
    });

    it('fuzzySearch() -> should find one user with object as first parameter', async () => {
      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
    });

    it('fuzzySearch() -> should find one user with object with empty query as first parameter (with `prefixOnly`)', async () => {
      const result = await Model.fuzzySearch({ query: '', prefixOnly: true });
      expect(result).toHaveLength(1);
    });

    it('fuzzySearch() -> should find one user with object as first parameter (with `prefixOnly`)', async () => {
      const result = await Model.fuzzySearch({
        query: 'Joe',
        prefixOnly: true,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('mongoose_fuzzy_searching with options and without callback', () => {
    const Model = db.createSchema({ name: String, lastName: String })(fuzzySearching, [
      {
        name: 'name',
        minSize: 2,
      },
    ]);

    beforeAll(async () => {
      await db.seed(Model, { name: 'Joe', lastName: 'Doe' });
    });

    it('fuzzySearch() -> should not be able to find users when the options searches for `lastName` with value `test`', async () => {
      const result = await Model.fuzzySearch('jo', { lastName: 'test' });
      expect(result).toHaveLength(0);
    });

    it('fuzzySearch() -> should be able to find users when the options searches for `lastName` with value `Doe`', async () => {
      const result = await Model.fuzzySearch('jo', { lastName: 'Doe' });
      expect(result).toHaveLength(1);
    });
  });

  describe('mongoose_fuzzy_searching with callback and without options', () => {
    const Model = db.createSchema({ name: String })(fuzzySearching, [
      {
        name: 'name',
        minSize: 2,
      },
    ]);

    beforeAll(async () => {
      await db.seed(Model, { name: 'Joe' });
    });

    it('fuzzySearch() -> should return the results with callback', () => {
      return new Promise((done) => {
        Model.fuzzySearch('jo', (err, doc) => {
          expect(err).toBe(null);
          expect(doc).toHaveLength(1);
          done(err);
        });
      });
    });
  });

  describe('mongoose_fuzzy_searching with options and callback', () => {
    const Model = db.createSchema({ name: String, lastName: String })(fuzzySearching, [
      {
        name: 'name',
        minSize: 2,
      },
    ]);

    beforeAll(async () => {
      await db.seed(Model, { name: 'Joe', lastName: 'Doe' });
    });

    it('fuzzySearch() -> should not be able to find users when the options searches for `lastName` with value `test` and return the result with callback', () => {
      return new Promise((done) => {
        Model.fuzzySearch('jo', { lastName: 'test' }, (err, doc) => {
          expect(err).toBe(null);
          expect(doc).toHaveLength(0);
          done(err);
        });
      });
    });

    it('fuzzySearch() -> should not be able to find users when the options searches for `lastName` with value `Doe` and return the result with callback', () => {
      return new Promise((done) => {
        Model.fuzzySearch('jo', { lastName: 'Doe' }, (err, doc) => {
          expect(err).toBe(null);
          expect(doc).toHaveLength(1);
          done(err);
        });
      });
    });
  });

  describe('mongoose_fuzzy_searching with `keys` attribute in fields', () => {
    describe('mongoose_fuzzy_searching with array of objects attribute', () => {
      const Model = db.createSchema({
        texts: [
          {
            title: String,
            description: String,
            language: String,
          },
        ],
      })(fuzzySearching, [
        {
          name: 'texts',
          escapeSpecialCharacters: false,
          keys: ['title', 'language'],
        },
      ]);

      beforeAll(async () => {
        await db.seed(Model, {
          texts: [
            {
              title: 'this is a title',
              description: 'descr!',
              language: 'en',
            },
            {
              title: 'awesome!',
              description: 'descr!',
              language: 'el',
            },
          ],
        });
      });

      it('fuzzySearch() -> should be able to find the title when the text is `this is`', async () => {
        const result = await Model.fuzzySearch('this is');
        expect(result).toHaveLength(1);
      });
    });

    describe('mongoose_fuzzy_searching with single object attribute', () => {
      const Model = db.createSchema({
        title: [
          {
            en: String,
            de: String,
            it: String,
          },
        ],
      })(fuzzySearching, [
        {
          name: 'title',
          escapeSpecialCharacters: false,
          keys: ['en', 'de', 'it'],
        },
      ]);

      beforeAll(async () => {
        await db.seed(Model, {
          title: {
            en: 'start wars',
            de: 'Krieg der Sterne',
            it: 'guerre stellari',
          },
        });
      });

      it('fuzzySearch() -> should be able to find the title when the text is `stellari`', async () => {
        const result = await Model.fuzzySearch('stellari');
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('mongoose_fuzzy_searching with `exact` option', () => {
    describe('mongoose_fuzzy_searching with array of objects attribute', () => {
      const Model = db.createSchema({
        name: String,
      })(fuzzySearching, ['name']);

      beforeAll(async () => {
        await Model.insertMany([{ name: 'Peter Pan' }, { name: 'Peter Ofori-Quaye' }]);
      });

      it('fuzzySearch() -> should be able to find the title when the text is `Peter Pan`', async () => {
        const exactResult = await Model.fuzzySearch({ query: 'Peter Pan', exact: true });
        const fuzzyResult = await Model.fuzzySearch({ query: 'Peter Pan' });

        expect(exactResult).toHaveLength(1);
        expect(fuzzyResult).toHaveLength(2);
      });
    });

    describe('mongoose_fuzzy_searching with single object attribute', () => {
      const Model = db.createSchema({
        title: [
          {
            en: String,
            de: String,
            it: String,
          },
        ],
      })(fuzzySearching, [
        {
          name: 'title',
          escapeSpecialCharacters: false,
          keys: ['en', 'de', 'it'],
        },
      ]);

      beforeAll(async () => {
        await db.seed(Model, {
          title: {
            en: 'start wars',
            de: 'Krieg der Sterne',
            it: 'guerre stellari',
          },
        });
      });

      it('fuzzySearch() -> should be able to find the title when the text is `stellari`', async () => {
        const result = await Model.fuzzySearch('stellari');
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('mongoose_fuzzy_searching should run user provided toObject & toJSON', () => {
    const Model = db.createSchema(
      { name: String },
      {
        toObject: {
          transform(doc, ret) {
            // eslint-disable-next-line no-param-reassign
            ret.toObjectTest = true;
            return ret;
          },
        },
        toJSON: {
          transform(doc, ret) {
            // eslint-disable-next-line no-param-reassign
            ret.toJSONTest = true;
            return ret;
          },
        },
      },
    )(fuzzySearching, [
      {
        name: 'name',
        minSize: 2,
      },
    ]);

    beforeAll(async () => {
      await db.seed(Model, { name: 'Joe' });
    });

    it("Should run user provided toObject and fuzzy searching's toObject", async () => {
      const result = await Model.fuzzySearch('Joe');
      expect(result).toHaveLength(1);
      expect(result[0].toObject()).toHaveProperty('toObjectTest');
      expect(result[0].toObject()).not.toHaveProperty('name_fuzzy');
    });

    it("Should run user provided toJSON and fuzzy searching's toJSON", async () => {
      const result = await Model.fuzzySearch('Joe');
      expect(result).toHaveLength(1);
      expect(result[0].toJSON()).toHaveProperty('toJSONTest');
      expect(result[0].toJSON()).not.toHaveProperty('name_fuzzy');
    });
  });

  describe('mongoose_fuzzy_searching with array of strings', () => {
    const Model = db.createSchema({
      tags: [String],
    })(fuzzySearching, ['tags']);

    beforeAll(async () => {
      await db.seed(Model, {
        tags: ['nature', 'fire', 'beauty', 'tenten'],
      });

      await db.seed(Model, {
        tags: ['test1', 'test2', 'test3'],
      });
    });

    it('fuzzySearch() -> should be able to find the tag when the text is `nature`', async () => {
      const result = await Model.fuzzySearch('natu');
      expect(result).toHaveLength(1);
    });

    it('fuzzySearch() -> should be able to return empty array when the text is `bollocks`', async () => {
      const result = await Model.fuzzySearch('bollocks');
      expect(result).toHaveLength(0);
    });
  });

  describe('mongoose_fuzzy_searching pre middlewares', () => {
    describe('mongoose_fuzzy_searching update user with `findOneAndUpdate`', () => {
      const Model = db.createSchema({ name: String, age: Number })(fuzzySearching, [
        {
          name: 'name',
          minSize: 2,
        },
      ]);

      beforeAll(async () => {
        const obj = await db.seed(Model, { name: 'Joe' });
        await Model.findOneAndUpdate(obj._id, { age: 30 });
      });

      it('fuzzySearch() -> should return Promise', () => {
        const result = Model.fuzzySearch('jo');
        expect(result).toHaveProperty('then');
      });

      it('fuzzySearch() -> should find one user with string as first parameter', async () => {
        const result = await Model.fuzzySearch('jo');
        expect(result).toHaveLength(1);
      });

      it('fuzzySearch() -> should find one user with object as first parameter', async () => {
        const result = await Model.fuzzySearch({ query: 'jo' });
        expect(result).toHaveLength(1);
      });
    });

    describe('mongoose_fuzzy_searching update user with `update`', () => {
      const Model = db.createSchema({ name: String })(fuzzySearching, [
        {
          name: 'name',
          minSize: 2,
        },
      ]);

      beforeAll(async () => {
        const obj = await db.seed(Model, { name: 'Joe' });
        await Model.update({ _id: obj._id }, { name: 'Someone' });
      });

      it('fuzzySearch() -> should return Promise', () => {
        const result = Model.fuzzySearch('some');
        expect(result).toHaveProperty('then');
      });

      it('fuzzySearch() -> should find one user with string as first parameter', async () => {
        const result = await Model.fuzzySearch('some');
        expect(result).toHaveLength(1);
      });

      it('fuzzySearch() -> should find one user with object as first parameter', async () => {
        const result = await Model.fuzzySearch({ query: 'some' });
        expect(result).toHaveLength(1);
      });
    });

    describe('mongoose_fuzzy_searching update user with `updateOne`', () => {
      const Model = db.createSchema({ name: String })(fuzzySearching, [
        {
          name: 'name',
          minSize: 2,
        },
      ]);

      beforeAll(async () => {
        const obj = await db.seed(Model, { name: 'Joe' });
        await Model.updateOne({ _id: obj._id }, { name: 'Someone' });
      });

      it('fuzzySearch() -> should return Promise', () => {
        const result = Model.fuzzySearch('some');
        expect(result).toHaveProperty('then');
      });

      it('fuzzySearch() -> should find one user with string as first parameter', async () => {
        const result = await Model.fuzzySearch('some');
        expect(result).toHaveLength(1);
      });

      it('fuzzySearch() -> should find one user with object as first parameter', async () => {
        const result = await Model.fuzzySearch({ query: 'some' });
        expect(result).toHaveLength(1);
      });
    });

    describe('mongoose_fuzzy_searching insert users with `insertMany`', () => {
      const Model = db.createSchema({ name: String })(fuzzySearching, [
        {
          name: 'name',
          minSize: 2,
        },
      ]);

      beforeAll(async () => {
        await Model.insertMany([{ name: 'Vassilis' }, { name: 'Dimitris' }]);
      });

      it('fuzzySearch() -> should return Promise', () => {
        const result = Model.fuzzySearch('vassi');
        expect(result).toHaveProperty('then');
      });

      it('fuzzySearch() -> should find one user with string as first parameter', async () => {
        const result = await Model.fuzzySearch('vassi');
        expect(result).toHaveLength(1);
      });
    });

    describe('mongoose_fuzzy_searching update users with `updateMany`', () => {
      const Model = db.createSchema({ name: String })(fuzzySearching, [
        {
          name: 'name',
          minSize: 2,
        },
      ]);

      beforeAll(async () => {
        await Model.insertMany([{ name: 'Vassilis' }, { name: 'Dimitris' }]);
        await Model.updateMany({ name: 'Vassilis' }, { name: 'Pallas' });
      });

      it('fuzzySearch() -> should return Promise', () => {
        const result = Model.fuzzySearch('pall');
        expect(result).toHaveProperty('then');
      });

      it('fuzzySearch() -> should find one user with string as first parameter', async () => {
        const result = await Model.fuzzySearch('pall');
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('mongoose_fuzzy_searching custom `pre` middlewares', () => {
    const schema = { name: String, age: Number, skill: String };

    it('should call `preSave`', async () => {
      const preSave = jest.fn().mockImplementation(function () {
        this.skill = 'amazing';
      });

      const Model = db.createSchema(schema)(
        fuzzySearching,
        [
          {
            name: 'name',
            minSize: 2,
          },
        ],
        {
          preSave,
        },
      );

      await db.seed(Model, { name: 'Joe', age: 30 });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preSave).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preUpdate`', async () => {
      const preUpdate = jest.fn().mockImplementation(function () {});

      const Model = db.createSchema(schema)(
        fuzzySearching,
        [
          {
            name: 'name',
            minSize: 2,
          },
        ],
        {
          preUpdate,
        },
      );

      const obj = await db.seed(Model, { name: 'Joe', age: 30 });
      await Model.update({ _id: obj._id }, { skill: 'amazing' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preUpdate).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preFindOneAndUpdate`', async () => {
      const preFindOneAndUpdate = jest.fn().mockImplementation(function () {});

      const Model = db.createSchema(schema)(
        fuzzySearching,
        [
          {
            name: 'name',
            minSize: 2,
          },
        ],
        {
          preFindOneAndUpdate,
        },
      );

      const obj = await db.seed(Model, { name: 'Joe', age: 30 });
      await Model.findByIdAndUpdate(obj._id, { skill: 'amazing' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preFindOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preInsertMany`', async () => {
      const preInsertMany = jest.fn().mockImplementation(function (docs) {
        docs.forEach((doc) => {
          doc.skill = 'amazing';
        });
      });

      const Model = db.createSchema(schema)(
        fuzzySearching,
        [
          {
            name: 'name',
            minSize: 2,
          },
        ],
        {
          preInsertMany,
        },
      );

      await Model.insertMany([
        { name: 'Joe', age: 30 },
        { name: 'Doe', age: 26 },
      ]);

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preInsertMany).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preUpdateMany`', async () => {
      const preUpdateMany = jest.fn().mockImplementation(function () {});

      const Model = db.createSchema(schema)(
        fuzzySearching,
        [
          {
            name: 'name',
            minSize: 2,
          },
        ],
        {
          preUpdateMany,
        },
      );

      await Model.insertMany([
        { name: 'Joe', age: 30 },
        { name: 'Doe', age: 26 },
      ]);
      await Model.updateMany({ name: 'Doe' }, { name: 'Foe' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preUpdateMany).toHaveBeenCalledTimes(1);
    });

    it('should call `preUpdateOne`', async () => {
      const preUpdateOne = jest.fn().mockImplementation(function () {});

      const Model = db.createSchema(schema)(
        fuzzySearching,
        [
          {
            name: 'name',
            minSize: 2,
          },
        ],
        {
          preUpdateOne,
        },
      );

      const obj = await db.seed(Model, { name: 'Joe', age: 30 });
      await Model.updateOne({ _id: obj._id }, { skill: 'amazing' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preUpdateOne).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preSave` nad `preUpdate`', async () => {
      const preUpdate = jest.fn().mockImplementation(function () {});
      const preSave = jest.fn().mockImplementation(function () {});

      const Model = db.createSchema(schema)(
        fuzzySearching,
        [
          {
            name: 'name',
            minSize: 2,
          },
        ],
        {
          preSave,
          preUpdate,
        },
      );

      const obj = await db.seed(Model, { name: 'Joe', age: 30 });
      await Model.update({ _id: obj._id }, { skill: 'amazing' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preSave).toHaveBeenCalledTimes(1);
      expect(preUpdate).toHaveBeenCalledTimes(1);
      // expect preSave to be called before preUpdate
      expect(preSave.mock.invocationCallOrder[0]).toBeLessThan(
        preUpdate.mock.invocationCallOrder[0],
      );
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call promise', async () => {
      const preSave = jest.fn().mockImplementation(async function () {
        return new Promise((resolve) => {
          setTimeout(() => {
            this.skill = 'amazing';
            resolve();
          }, 2000);
        });
      });

      const Model = db.createSchema(schema)(
        fuzzySearching,
        [
          {
            name: 'name',
            minSize: 2,
          },
        ],
        {
          preSave,
        },
      );

      await db.seed(Model, { name: 'Joe', age: 30 });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preSave).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });
  });
});
