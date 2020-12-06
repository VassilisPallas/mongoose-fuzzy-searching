import { MongooseSchemaOptions, DocumentToObjectOptions, Fields } from '../../types';

import { isFunction } from '../utils';
import { removeFuzzyElements } from './fields';

const tranformer = (fields: Fields) => (docToObj?: DocumentToObjectOptions) => ({
  ...(docToObj || {}),
  transform: (doc: any, ret: any, options: any) => {
    // Execute first the default tranformer funtion (toObject or toJSON) if is set
    // and then run the custom transformer that removes the fuzzy elements
    if (docToObj && docToObj.transform && isFunction(docToObj.transform)) {
      docToObj.transform(doc, ret, options);
    }

    return removeFuzzyElements(fields)(doc, ret);
  },
});

export const setTransformers = (
  fields: Fields,
  options?: MongooseSchemaOptions,
): {
  toObject: DocumentToObjectOptions;
  toJSON: DocumentToObjectOptions;
} => {
  const transform = tranformer(fields);

  return {
    toJSON: transform(options?.toJSON),
    toObject: transform(options?.toObject),
  };
};
