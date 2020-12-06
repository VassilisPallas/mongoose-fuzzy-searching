import { openConnection, closeConnection, createTestModel } from './support/db';
import { confidenceScore, sort as pluginSort } from '../src';

import { Fields } from '../src/types';

beforeAll(async () => {
  await openConnection();
});

afterAll(async () => {
  await closeConnection();
});

describe('fuzzySearch', () => {
  describe('mongoose_fuzzy_searching without options and callback', () => {
    const schemaStructure = { name: String };

    interface TestSchema {
      name?: string;
    }

    const pluginFields: Fields = [
      {
        name: 'name',
        minSize: 2,
      },
    ];

    const TestModel = createTestModel<TestSchema>('without options and callback', {
      schemaStructure,
      pluginFields,
    });
    const Model = TestModel.model;

    beforeAll(async () => {
      await TestModel.seed({ name: 'Joe' });
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
    const schemaStructure = { name: String, lastName: String };

    interface TestSchema {
      name?: string;
      lastName?: string;
    }

    const pluginFields: Fields = [
      {
        name: 'name',
        minSize: 2,
      },
    ];

    const TestModel = createTestModel<TestSchema>('with options and without callback', {
      schemaStructure,
      pluginFields,
    });
    const Model = TestModel.model;

    beforeAll(async () => {
      await TestModel.seed({ name: 'Joe', lastName: 'Doe' });
    });

    it('fuzzySearch() -> should not be able to find users when the options searches for `lastName` with value `test`', async () => {
      const result = await Model.fuzzySearch('jo', { name: 'd' });
      expect(result).toHaveLength(0);
    });

    it('fuzzySearch() -> should be able to find users when the options searches for `lastName` with value `Doe`', async () => {
      const result = await Model.fuzzySearch('jo', { lastName: 'Doe' });
      expect(result).toHaveLength(1);
    });
  });

  describe('mongoose_fuzzy_searching with callback and without options', () => {
    const schemaStructure = { name: String };

    interface TestSchema {
      name?: string;
    }

    const pluginFields: Fields = [
      {
        name: 'name',
        minSize: 2,
      },
    ];

    const TestModel = createTestModel<TestSchema>('with callback and without options', {
      schemaStructure,
      pluginFields,
    });
    const Model = TestModel.model;

    beforeAll(async () => {
      await TestModel.seed({ name: 'Joe' });
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
    const schemaStructure = { name: String, lastName: String };

    interface TestSchema {
      name?: string;
      lastName?: string;
    }

    const pluginFields: Fields = [
      {
        name: 'name',
        minSize: 2,
      },
    ];

    const TestModel = createTestModel<TestSchema>('with options and callback', {
      schemaStructure,
      pluginFields,
    });
    const Model = TestModel.model;

    beforeAll(async () => {
      await TestModel.seed({ name: 'Joe', lastName: 'Doe' });
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
      const schemaStructure = {
        texts: [
          {
            title: String,
            description: String,
            language: String,
          },
        ],
      };

      interface TestSchema {
        texts: {
          title: string;
          description: string;
          language: string;
        }[];
      }

      const pluginFields: Fields = [
        {
          name: 'texts',
          escapeSpecialCharacters: false,
          keys: ['title', 'language'],
        },
      ];

      const TestModel = createTestModel<TestSchema>('keys with array of objects attribute', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

      beforeAll(async () => {
        await TestModel.seed({
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
      const schemaStructure = {
        title: {
          en: String,
          de: String,
          it: String,
        },
      };

      interface TestSchema {
        title: {
          en: string;
          de: string;
          it: string;
        };
      }

      const pluginFields: Fields = [
        {
          name: 'title',
          escapeSpecialCharacters: false,
          keys: ['en', 'de', 'it'],
          minSize: 3,
        },
      ];

      const TestModel = createTestModel<TestSchema>('keys with single object attribute', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

      beforeAll(async () => {
        await TestModel.seed({
          title: {
            en: 'start wars',
            de: 'Krieg der Sterne',
            it: 'guerre stellari',
          },
        });
      });

      it('fuzzySearch() -> should be able to find the title when the text is `stellari`', async () => {
        const ItalianResult = await Model.fuzzySearch('ste');
        const GermanResult = await Model.fuzzySearch('kri');
        const EnglishResult = await Model.fuzzySearch('war');

        expect(ItalianResult).toHaveLength(1);
        expect(GermanResult).toHaveLength(1);
        expect(EnglishResult).toHaveLength(1);
      });
    });
  });

  describe('mongoose_fuzzy_searching with `exact` option', () => {
    describe('mongoose_fuzzy_searching with array of objects attribute', () => {
      const schemaStructure = {
        name: String,
      };

      interface TestSchema {
        name: string;
      }

      const pluginFields: Fields = ['name'];

      const TestModel = createTestModel<TestSchema>('exact with array of objects attribute', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

      beforeAll(async () => {
        await TestModel.seedMany([{ name: 'Peter Pan' }, { name: 'Peter Ofori-Quaye' }]);
      });

      it('fuzzySearch() -> should be able to find the title when the text is `Peter Pan`', async () => {
        const exactResult = await Model.fuzzySearch({ query: 'Peter Pan', exact: true });
        const fuzzyResult = await Model.fuzzySearch({ query: 'Peter Pan' });

        expect(exactResult).toHaveLength(1);
        expect(fuzzyResult).toHaveLength(2);
      });
    });

    describe('mongoose_fuzzy_searching with single object attribute', () => {
      const schemaStructure = {
        title: {
          en: String,
          de: String,
          it: String,
        },
      };

      interface TestSchema {
        title: {
          en: string;
          de: string;
          it: string;
        };
      }

      const pluginFields: Fields = [
        {
          name: 'title',
          escapeSpecialCharacters: false,
          keys: ['en', 'de', 'it'],
        },
      ];

      const TestModel = createTestModel<TestSchema>('exact with single object attribute', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

      beforeAll(async () => {
        await TestModel.seed({
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
    const schemaStructure = { name: String };

    interface TestSchema {
      name: string;
      toObjectTest?: boolean;
      toJSONTest?: boolean;
    }

    const pluginFields: Fields = [
      {
        name: 'name',
        minSize: 2,
      },
    ];

    const TestModel = createTestModel<TestSchema>('toObject and toJSON', {
      schemaStructure,
      pluginFields,
      pluginSchemaOptions: {
        toObject: {
          transform(doc, ret) {
            ret.toObjectTest = true;
            return ret;
          },
        },
        toJSON: {
          transform(doc, ret) {
            ret.toJSONTest = true;
            return ret;
          },
        },
      },
    });
    const Model = TestModel.model;

    beforeAll(async () => {
      await TestModel.seed({ name: 'Joe' });
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
    const schemaStructure = { tags: [String] };

    interface TestSchema {
      tags: string[];
    }

    const pluginFields: Fields = ['tags'];

    const TestModel = createTestModel<TestSchema>('with array of strings', {
      schemaStructure,
      pluginFields,
    });
    const Model = TestModel.model;

    beforeAll(async () => {
      await TestModel.seed({ tags: ['nature', 'fire', 'beauty', 'tenten'] });
      await TestModel.seed({ tags: ['test1', 'test2', 'test3'] });
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
      const schemaStructure = {
        name: String,
        age: Number,
      };

      interface TestSchema {
        name: string;
        age?: number;
      }

      const pluginFields: Fields = [
        {
          name: 'name',
          minSize: 2,
        },
      ];

      const TestModel = createTestModel<TestSchema>('pre update user with findOneAndUpdate', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

      beforeAll(async () => {
        const obj = await TestModel.seed({ name: 'Joe' });
        await Model.findOneAndUpdate({ _id: obj._id }, { age: 30 });
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
      const schemaStructure = {
        name: String,
      };

      interface TestSchema {
        name: string;
      }

      const pluginFields: Fields = [
        {
          name: 'name',
          minSize: 2,
        },
      ];

      const TestModel = createTestModel<TestSchema>('pre update user with update', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

      beforeAll(async () => {
        const obj = await TestModel.seed({ name: 'Joe' });
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
      const schemaStructure = {
        name: String,
      };

      interface TestSchema {
        name: string;
      }

      const pluginFields: Fields = [
        {
          name: 'name',
          minSize: 2,
        },
      ];

      const TestModel = createTestModel<TestSchema>('pre update user with updateOne', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

      beforeAll(async () => {
        const obj = await TestModel.seed({ name: 'Joe' });
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
      const schemaStructure = {
        name: String,
      };

      interface TestSchema {
        name: string;
      }

      const pluginFields: Fields = [
        {
          name: 'name',
          minSize: 2,
        },
      ];

      const TestModel = createTestModel<TestSchema>('pre insert user with insertMany', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

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
      const schemaStructure = {
        name: String,
      };

      interface TestSchema {
        name: string;
      }

      const pluginFields: Fields = [
        {
          name: 'name',
          minSize: 2,
        },
      ];

      const TestModel = createTestModel<TestSchema>('pre update user with updateMany', {
        schemaStructure,
        pluginFields,
      });
      const Model = TestModel.model;

      beforeAll(async () => {
        await TestModel.seedMany([{ name: 'Vassilis' }, { name: 'Dimitris' }]);
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
    const schemaStructure = { name: String, age: Number, skill: String };

    interface TestSchema {
      name: string;
      age: number;
      skill?: string;
    }

    const pluginFields: Fields = [
      {
        name: 'name',
        minSize: 2,
      },
    ];

    it('should call `preSave`', async () => {
      const preSave = jest.fn().mockImplementation(function (this: TestSchema) {
        this.skill = 'amazing';
      });

      const TestModel = createTestModel<TestSchema>('custom pre preSave', {
        schemaStructure,
        pluginFields,
        middlewares: [
          {
            name: 'save',
            fn: preSave,
          },
        ],
      });
      const Model = TestModel.model;

      await TestModel.seed({ name: 'Joe', age: 30 });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preSave).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preUpdate`', async () => {
      const preUpdate = jest.fn();

      const TestModel = createTestModel<TestSchema>('custom pre preUpdate', {
        schemaStructure,
        pluginFields,
        middlewares: [
          {
            name: 'update',
            fn: preUpdate,
          },
        ],
      });
      const Model = TestModel.model;

      const obj = await TestModel.seed({ name: 'Joe', age: 30 });
      await Model.update({ _id: obj._id }, { skill: 'amazing' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preUpdate).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preFindOneAndUpdate`', async () => {
      const preFindOneAndUpdate = jest.fn();

      const TestModel = createTestModel<TestSchema>('custom pre preFindOneAndUpdate', {
        schemaStructure,
        pluginFields,
        middlewares: [
          {
            name: 'findOneAndUpdate',
            fn: preFindOneAndUpdate,
          },
        ],
      });
      const Model = TestModel.model;

      const obj = await TestModel.seed({ name: 'Joe', age: 30 });
      await Model.findByIdAndUpdate(obj._id, { skill: 'amazing' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preFindOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preInsertMany`', async () => {
      const docs = [
        { name: 'Joe', age: 30 },
        { name: 'Doe', age: 26 },
      ];

      const Mock = jest.fn().mockImplementation(function (d: TestSchema[]) {
        d.forEach((doc: TestSchema) => {
          doc.skill = 'amazing';
        });
      });

      const preInsertMany = Mock.bind(docs, docs, docs);

      const TestModel = createTestModel<TestSchema>('custom pre preInsertMany', {
        schemaStructure,
        pluginFields,
        middlewares: [
          {
            name: 'insertMany',
            fn: preInsertMany,
          },
        ],
      });
      const Model = TestModel.model;

      await Model.insertMany(docs);

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(Mock).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preUpdateMany`', async () => {
      const preUpdateMany = jest.fn();

      const TestModel = createTestModel<TestSchema>('custom pre preUpdateMany', {
        schemaStructure,
        pluginFields,
        middlewares: [
          {
            name: 'updateMany',
            fn: preUpdateMany,
          },
        ],
      });
      const Model = TestModel.model;

      await TestModel.seedMany([
        { name: 'Joe', age: 30 },
        { name: 'Doe', age: 26 },
      ]);
      await Model.updateMany({ name: 'Doe' }, { name: 'Foe' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preUpdateMany).toHaveBeenCalledTimes(1);
    });

    it('should call `preUpdateOne`', async () => {
      const preUpdateOne = jest.fn();

      const TestModel = createTestModel<TestSchema>('custom pre preUpdateOne', {
        schemaStructure,
        pluginFields,
        middlewares: [
          {
            name: 'updateOne',
            fn: preUpdateOne,
          },
        ],
      });
      const Model = TestModel.model;
      const obj = await TestModel.seed({ name: 'Joe', age: 30 });
      await Model.updateOne({ _id: obj._id }, { skill: 'amazing' });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preUpdateOne).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });

    it('should call `preSave` and `preUpdate`', async () => {
      const preUpdate = jest.fn();
      const preSave = jest.fn();

      const TestModel = createTestModel<TestSchema>('custom pre preSave and preUpdate', {
        schemaStructure,
        pluginFields,
        middlewares: [
          {
            name: 'save',
            fn: preSave,
          },
          {
            name: 'update',
            fn: preUpdate,
          },
        ],
      });
      const Model = TestModel.model;
      const obj = await TestModel.seed({ name: 'Joe', age: 30 });

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
      const preSave = jest.fn().mockImplementation(async function (this: TestSchema) {
        return new Promise((resolve) => {
          setTimeout(() => {
            this.skill = 'amazing';
            resolve();
          }, 2000);
        });
      });

      const TestModel = createTestModel<TestSchema>('custom pre preSave promise', {
        schemaStructure,
        pluginFields,
        middlewares: [
          {
            name: 'save',
            fn: preSave,
          },
        ],
      });
      const Model = TestModel.model;
      await TestModel.seed({ name: 'Joe', age: 30 });

      const result = await Model.fuzzySearch({ query: 'jo' });
      expect(result).toHaveLength(1);
      expect(preSave).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('skill', 'amazing');
    });
  });

  describe('mongoose_fuzzy_searching with query helper', () => {
    const schemaStructure = { name: String, age: Number };

    interface TestSchema {
      name: string;
      age: number;
    }

    const pluginFields: Fields = [
      {
        name: 'name',
        minSize: 2,
      },
    ];

    const TestModel = createTestModel<TestSchema>('with query helper', {
      schemaStructure,
      pluginFields,
    });
    const Model = TestModel.model;

    beforeAll(async () => {
      await TestModel.seed({ name: 'Joe', age: 30 });
    });

    it('fuzzySearch() -> should return the results by chaing queries', async () => {
      const result = await Model.find(
        { age: { $gte: 30 } },
        confidenceScore,
        pluginSort,
      ).fuzzySearch('jo');
      expect(result).toHaveLength(1);
    });
  });
});
