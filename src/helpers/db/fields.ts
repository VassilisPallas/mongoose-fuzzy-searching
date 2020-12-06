import { isString, prepareNgrams } from '../utils';
import { makeNGrams } from '../ngrams';
import {
  MongooseSchema,
  FieldObject,
  Attributes,
  Fields,
  FieldIndexes,
  KeyFieldObject,
} from '../../types';

interface Options {
  default: string | [];
  index: boolean;
}

abstract class FieldCreator {
  protected createByFieldType = (item: string | FieldObject) => {
    if (isString(item)) {
      this.fromString(item as string);
      return;
    }

    if ((<FieldObject>item).keys) {
      this.fromObjectKeys(item as FieldObject);
      return;
    }

    this.fromObject(item as FieldObject);
  };

  public createByFields(fields: Fields) {
    fields.forEach(this.createByFieldType);
    return this;
  }

  abstract fromString(item: string): void;

  abstract fromObject(item: FieldObject): void;

  abstract fromObjectKeys(item: FieldObject): void;
}

class Create extends FieldCreator {
  private _indexes: FieldIndexes['indexes'] = {};

  private _weights: FieldIndexes['weights'] = {};

  constructor(private schema: MongooseSchema) {
    super();
  }

  createSchemaObject(typeValue: any, options: Options): Options & { type: any } {
    return {
      ...options,
      type: typeValue,
    };
  }

  private addToSchema = (name: string) => {
    return {
      [`${name}_fuzzy`]: this.createSchemaObject([MongooseSchema.Types.String], {
        default: '',
        index: false,
      }),
    };
  };

  private addArrayToSchema = (name: string) => {
    return {
      [`${name}_fuzzy`]: this.createSchemaObject(MongooseSchema.Types.Mixed, {
        default: [],
        index: false,
      }),
    };
  };

  fromString(item: string): void {
    this.schema.add(this.addToSchema(item));
    this.indexes[`${item}_fuzzy`] = 'text';
  }

  fromObject(item: FieldObject): void {
    this.schema.add(this.addToSchema(item.name));
    this.indexes[`${item.name}_fuzzy`] = 'text';
    if (item.weight) {
      this.weights[`${item.name}_fuzzy`] = item.weight;
    }
  }

  fromObjectKeys(item: KeyFieldObject): void {
    item.keys.forEach((key) => {
      this.indexes[`${item.name}_fuzzy.${key}_fuzzy`] = 'text';
    });
    this.schema.add(this.addArrayToSchema(item.name));
  }

  get indexes() {
    return this._indexes;
  }

  get weights() {
    return this._weights;
  }
}

class Remove extends FieldCreator {
  constructor(private _schema: MongooseSchema) {
    super();
  }

  fromString(item: string): void {
    delete this.schema[`${item}_fuzzy`];
  }

  fromObject(item: FieldObject): void {
    delete this.schema[`${item.name}_fuzzy`];
  }

  fromObjectKeys(item: KeyFieldObject): void {
    delete this.schema[`${item.name}_fuzzy`];
  }

  get schema() {
    return this._schema;
  }
}

class Generate extends FieldCreator {
  constructor(private _attributes: Attributes) {
    super();
  }

  get attributes(): Attributes {
    return this._attributes;
  }

  fromString(item: string): void {
    let value: string = this.attributes[item];

    if (value === undefined) {
      return;
    }

    if (value === null || value === '') {
      this.attributes[`${item}_fuzzy`] = [];
      return;
    }

    if (Array.isArray(value)) {
      value = value.join(' ');
    }

    const options = prepareNgrams({ text: value });
    this.attributes[`${item}_fuzzy`] = makeNGrams(options);
  }

  fromObject(item: FieldObject): void {
    let value: string = this.attributes[`${item.name}`];

    if (value === undefined) {
      return;
    }

    if (value === null || value === '') {
      this.attributes[`${item.name}_fuzzy`] = [];
      return;
    }

    const escapeSpecialCharacters = item.escapeSpecialCharacters !== false;
    const { minSize, prefixOnly } = item;

    if (Array.isArray(value)) {
      value = value.join(' ');
    }

    const options = prepareNgrams({
      text: value,
      escapeSpecialCharacters,
      minSize,
      prefixOnly,
    });

    this.attributes[`${item.name}_fuzzy`] = makeNGrams(options);
  }

  fromObjectKeys(item: KeyFieldObject): void {
    const value = this.attributes[`${item.name}`];

    if (value === undefined) {
      return;
    }

    if (value === null) {
      this.attributes[`${item.name}_fuzzy`] = [];
      return;
    }

    const escapeSpecialCharacters = item.escapeSpecialCharacters !== false;
    const attrs: Attributes[] = [];
    let obj: Attributes = {};

    let data = this.attributes[item.name];
    if (!Array.isArray(data)) {
      data = [data];
    }

    data.forEach((attributes: Attributes) => {
      const { minSize, prefixOnly } = item;

      item.keys.forEach((key) => {
        const text = attributes[key];

        if (text === undefined) {
          return;
        }

        const options = prepareNgrams({
          text,
          escapeSpecialCharacters,
          minSize,
          prefixOnly,
        });

        obj = {
          ...obj,
          [`${key}_fuzzy`]: text === null || text === '' ? [] : makeNGrams(options),
        };
      });
      attrs.push(obj);
    });
    this.attributes[`${item.name}_fuzzy`] = attrs;
  }
}

export const createFields = (schema: MongooseSchema, fields: Fields): FieldIndexes => {
  const create = new Create(schema).createByFields(fields);
  return { indexes: create.indexes, weights: create.weights };
};

export const removeFuzzyElements = (fields: Fields) => (
  _doc: any,
  ret: any,
): MongooseSchema<any> => {
  return new Remove(ret).createByFields(fields).schema;
};

export const createNGrams = (attributes: Attributes, fields: Fields): void => {
  new Generate(attributes).createByFields(fields);
};
