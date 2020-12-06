import {
  StaticFuzzyParameters,
  QueryFuzzyParameters,
  MongooseCriteria,
  MongooseCallback,
  Query,
  MongooseModel,
  QueryObject,
  FuzzyParameters,
  StaticFuzzyReturn,
  QueryFuzzyReturn,
  SearchableModel,
} from '../../types';

import { isFunction, isObject, isString, prepareNgrams, prepareQuery } from '../utils';
import { makeNGrams } from '../ngrams';

export const confidenceScore = { confidenceScore: { $meta: 'textScore' } };
export const sort = { sort: { confidenceScore: { $meta: 'textScore' } } };

abstract class FuzzySearch<T extends FuzzyParameters, U> {
  private _query: Query = '';

  private _options: MongooseCriteria = {};

  protected abstract initializeParameter(...args: T): U;

  abstract search(model: MongooseModel): any;

  private getQueryArgs() {
    if (isString(this.query)) {
      return prepareQuery(this.query as string);
    }

    const queryObj = this.query as QueryObject;
    return prepareQuery(queryObj.query, queryObj);
  }

  private buildQuery(query: string): MongooseCriteria {
    const $text = {
      $search: query,
    };

    if (!isObject(this.options)) {
      return { $text };
    }

    return {
      $and: [{ $text }, this.options],
    };
  }

  protected find(model: SearchableModel, options: any) {
    return model.find.apply(model, options);
  }

  protected get searchQuery(): MongooseCriteria {
    const { prefixOnly, exact, minSize, query } = this.getQueryArgs();
    if (!query) {
      return {};
    }

    const generatedQuery = exact
      ? `"${query}"`
      : makeNGrams(
          prepareNgrams({
            text: query,
            escapeSpecialCharacters: false,
            minSize,
            prefixOnly,
          }),
        ).join(' ');

    return this.buildQuery(generatedQuery);
  }

  protected set query(query: Query) {
    this._query = query;
  }

  protected get query() {
    return this._query;
  }

  protected set options(options: MongooseCriteria) {
    this._options = options;
  }

  protected get options() {
    return this._options;
  }
}

export class StaticFuzzySearch extends FuzzySearch<StaticFuzzyParameters, StaticFuzzyReturn> {
  private callback?: MongooseCallback;

  constructor(...args: StaticFuzzyParameters) {
    super();

    const { callback, options, query } = this.initializeParameter(...args);
    this.query = query;
    this.options = options;
    this.callback = callback;
  }

  protected initializeParameter(
    ...args: StaticFuzzyParameters
  ): {
    query: Query;
    options: MongooseCriteria;
    callback?: MongooseCallback | undefined;
  } {
    const query: Query = args[0];
    let options: MongooseCriteria = {};
    let callback: MongooseCallback | undefined;

    if (args[1] && isFunction(args[1])) {
      callback = args[1] as MongooseCallback;
    } else if (args[1] && isObject(args[1])) {
      options = args[1] as MongooseCriteria;
    }

    if (callback === undefined && args[2] && isFunction(args[2])) {
      callback = args[2] as MongooseCallback;
    }

    return { query, options, callback };
  }

  search(model: SearchableModel): any {
    return this.find(model, [this.searchQuery, confidenceScore, sort, this.callback]);
  }
}

export class QueryFuzzySearch extends FuzzySearch<QueryFuzzyParameters, QueryFuzzyReturn> {
  constructor(...args: QueryFuzzyParameters) {
    super();

    const { options, query } = this.initializeParameter(...args);
    this.query = query;
    this.options = options;
  }

  protected initializeParameter(
    ...args: QueryFuzzyParameters
  ): {
    query: Query;
    options: MongooseCriteria;
  } {
    const query: Query = args[0];
    let options: MongooseCriteria = {};

    if (args[1] && isObject(args[1])) {
      options = args[1] as MongooseCriteria;
    }

    return { query, options };
  }

  search(model: SearchableModel): any {
    return this.find(model, [this.searchQuery]);
  }
}
