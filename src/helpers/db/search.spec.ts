import { QueryFuzzySearch, StaticFuzzySearch, confidenceScore, sort } from './search';
import {
  StaticFuzzyParameters,
  QueryObject,
  QueryFuzzyParameters,
  SearchableModel,
} from '../../types';

jest.mock('../ngrams');

describe('StaticFuzzySearch', () => {
  it('should call `find` with string query, empty options and callback', () => {
    const query = 'Text to search';
    const callback = jest.fn();

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: StaticFuzzyParameters = [query, {}, callback];
    new StaticFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith(
      {
        $text: {
          $search: query,
        },
      },
      confidenceScore,
      sort,
      callback,
    );
  });

  it('should call `find` with object query, empty options and callback', () => {
    const query: QueryObject = {
      query: 'Text to search',
    };
    const callback = jest.fn();

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: StaticFuzzyParameters = [query, {}, callback];
    new StaticFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith(
      {
        $text: {
          $search: query.query,
        },
      },
      confidenceScore,
      sort,
      callback,
    );
  });

  it('should call `find` with string query, options and callback', () => {
    const query = 'Text to search';
    const options = { field: { $ne: null } };
    const callback = jest.fn();

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: StaticFuzzyParameters = [query, options, callback];
    new StaticFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith(
      {
        $and: [
          {
            $text: {
              $search: query,
            },
          },
          options,
        ],
      },
      confidenceScore,
      sort,
      callback,
    );
  });

  it('should call `find` with object query, options and callback', () => {
    const query: QueryObject = {
      query: 'Text to search',
    };
    const options = { field: { $ne: null } };
    const callback = jest.fn();

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: StaticFuzzyParameters = [query, options, callback];
    new StaticFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith(
      {
        $and: [
          {
            $text: {
              $search: query.query,
            },
          },
          options,
        ],
      },
      confidenceScore,
      sort,
      callback,
    );
  });

  it('should not pass callback to `find`', () => {
    const query: QueryObject = {
      query: 'Text to search',
    };
    const options = { field: { $ne: null } };

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: StaticFuzzyParameters = [query, options];
    new StaticFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith(
      {
        $and: [
          {
            $text: {
              $search: query.query,
            },
          },
          options,
        ],
      },
      confidenceScore,
      sort,
      undefined,
    );
  });
});

describe('QueryFuzzySearch', () => {
  it('should call `find` with string query and empty options', () => {
    const query = 'Text to search';

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: QueryFuzzyParameters = [query, {}];
    new QueryFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith({
      $text: {
        $search: query,
      },
    });
  });

  it('should call `find` with object query and empty options', () => {
    const query: QueryObject = {
      query: 'Text to search',
    };

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: QueryFuzzyParameters = [query, {}];
    new QueryFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith({
      $text: {
        $search: query.query,
      },
    });
  });

  it('should call `find` with string query and options', () => {
    const query = 'Text to search';
    const options = { field: { $ne: null } };

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: QueryFuzzyParameters = [query, options];
    new QueryFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith({
      $and: [
        {
          $text: {
            $search: query,
          },
        },
        options,
      ],
    });
  });

  it('should call `find` with object query and options', () => {
    const query: QueryObject = {
      query: 'Text to search',
    };
    const options = { field: { $ne: null } };

    const model: SearchableModel = {
      find: jest.fn(),
    };

    const args: QueryFuzzyParameters = [query, options];
    new QueryFuzzySearch(...args).search(model);

    expect(model.find).toHaveBeenCalledWith({
      $and: [
        {
          $text: {
            $search: query.query,
          },
        },
        options,
      ],
    });
  });
});
